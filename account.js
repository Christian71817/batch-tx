//批量创建账号脚本

const Web3 = require('web3');
const fs = require('fs');

//本次需要创建的账号数量 修改这个数字生成对应的账号 此脚本中生成一个包含100个账号与私钥的文件
//生成完毕后 可在transfer.js与mint.js脚本中调用
const number = 100

const web3 = new Web3(process.env.rpc_url);
let accounts = {}

for (let i = 0; i < number; i++) {
    let  account = web3.eth.accounts.create(web3.utils.randomHex(32));
    console.log(account)
    accounts[account.address] = account.privateKey
}


//将账号数据写入文件
const filename = __dirname + '/' +   web3.utils.randomHex(8) + '.js'
fs.writeFileSync(filename , "module.exports = " + JSON.stringify(accounts));

console.log(`创建${number}个账号完成，存储位置【${filename}】`);
