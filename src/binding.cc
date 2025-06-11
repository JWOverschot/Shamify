#include <napi.h>
#include <thread>
#include <atomic>
#include <fcntl.h>
#include <linux/input.h>
#include <unistd.h>
#include <dirent.h>
#include <string>
#include <vector>
#include <iostream>

std::atomic<bool> running{true};

std::vector<std::string> find_input_devices() {
    std::vector<std::string> devices;
    DIR* dir = opendir("/dev/input");
    if (!dir) return devices;
    struct dirent* ent;
    while ((ent = readdir(dir)) != nullptr) {
        if (strncmp(ent->d_name, "event", 5) == 0) {
            devices.push_back("/dev/input/" + std::string(ent->d_name));
        }
    }
    closedir(dir);
    return devices;
}

void listen_media_keys(Napi::ThreadSafeFunction tsfn) {
    auto devices = find_input_devices();
    std::vector<int> fds;
    for (const auto& dev : devices) {
        int fd = open(dev.c_str(), O_RDONLY | O_NONBLOCK);
        if (fd >= 0) fds.push_back(fd);
    }
    struct input_event ev;
    while (running) {
        for (int fd : fds) {
            ssize_t n = read(fd, &ev, sizeof(ev));
            if (n == sizeof(ev) && ev.type == EV_KEY && ev.value == 1) {
                int code = ev.code;
                std::string key;
                if (code == KEY_PLAYPAUSE) key = "MediaPlayPause";
                else if (code == KEY_NEXTSONG) key = "MediaNextTrack";
                else if (code == KEY_PREVIOUSSONG) key = "MediaPreviousTrack";
                else if (code == KEY_STOPCD) key = "MediaStop";
                if (!key.empty()) {
                    tsfn.BlockingCall([key](Napi::Env env, Napi::Function jsCallback) {
                        jsCallback.Call({Napi::String::New(env, key)});
                    });
                }
            }
        }
        usleep(10000); // 10ms
    }
    for (int fd : fds) close(fd);
}

Napi::Value StartListening(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!info[0].IsFunction()) {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return env.Null();
    }
    Napi::Function cb = info[0].As<Napi::Function>();
    Napi::ThreadSafeFunction tsfn = Napi::ThreadSafeFunction::New(
        env, cb, "MediaKeyListener", 0, 1
    );
    std::thread([tsfn]() mutable {
        listen_media_keys(tsfn);
        tsfn.Release();
    }).detach();
    return env.Null();
}

Napi::Value StopListening(const Napi::CallbackInfo& info) {
    running = false;
    return info.Env().Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("startListening", Napi::Function::New(env, StartListening));
    exports.Set("stopListening", Napi::Function::New(env, StopListening));
    return exports;
}

NODE_API_MODULE(binding, Init)
