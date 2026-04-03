const mongoose = require('mongoose');
const schema = new mongoose.Schema({ name: String });
schema.pre('save', async function(next) {
    if (typeof next !== 'function') {
        console.log('NEXT IS NOT A FUNCTION, typeof is:', typeof next);
        if (typeof next === 'object') console.log(Object.keys(next));
    } else {
        console.log('NEXT IS A FUNCTION');
    }
});
const Model = mongoose.model('Test', schema);
const m = new Model({ name: 'test' });
m.save({ validateBeforeSave: false }).catch(err => console.log('Err:', err.message));
