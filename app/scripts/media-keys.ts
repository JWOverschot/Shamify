import * as path from 'path';
// Use require for native binding
// eslint-disable-next-line @typescript-eslint/no-var-requires
const binding = require(path.resolve(__dirname, '../../build/Release/binding.node'));

binding.startListening((key: string) => {
    loadFooterContent();
    console.log('Media key pressed:', key);
});

export default binding;