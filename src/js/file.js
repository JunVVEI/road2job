const fs = require('fs')

// 读取文件方法
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {flag: 'r', encoding: 'utf-8'}, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    })
}

function writeFile(path, content) {


    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve('写入成功');
        });
    })
}

module.exports = {readFile, writeFile}