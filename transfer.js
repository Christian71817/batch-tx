
//批量转账脚本  若使用此脚本，你需要 修改你的账号文件名 用来加载你的账号 还有你的发送方地址和私钥
const Web3 = require('web3');
const { promisify } = require('util'); 
const sleep = promisify(setTimeout); 


//载入要批量转账的账号文件 如果没有这样的文件 请用account.js脚本进行生成 命令为 node ./account.js
// 如果你生成的账号文件为 0xd5669e3b932530fa.js 请在下面单引号内填写 ./0xd5669e3b932530fa
const accounts = require('./0xd5669e3b932530fa') 

//发送方账户地址 这个地址是你资金最多的那个地址，只有这个地址资金多才能向账号文件内的账号转账
const address = "" 

// 发送方账户私钥 这个私钥就是上面地址的私钥 注意私钥不加0x前缀
const private_key = ""

//向目标账户分发的金额 单位(ETH)
const amount = '0.000015' 

//指定gas价格 具体设置可以参考区块链浏览器当前的gas价格，比最高gas高出一部分即可 单位（Gwei）
const gweiGasPrice = '0.05' 

//转账RPC地址
const rpc_url = 'https://rpc-mainnet-1.bevm.io/' 

async function main() {
    const web3 = new Web3(rpc_url); 
    await web3.eth.net.isListening()
    const weiGasPrice = web3.utils.toWei(gweiGasPrice, 'gwei')
    const valueEth = web3.utils.toWei(amount, 'ether')

    let n = 0;
    for (let toAddress in accounts) {
        await sleep(3000) 
        const balance = await web3.eth.getBalance(address)
        const currentBalance = web3.utils.fromWei(balance, 'ether')
        console.log(`发送方账户余额【${currentBalance}】`)
        const nonce = await web3.eth.getTransactionCount(address);
      
        // //交易数据
        const transactionData = {
            nonce: nonce, //当前交易nonce
            from: address, //发送方钱包地址
            to: toAddress, //接收方钱包地址
            gasPrice: weiGasPrice, //gas价格 单位由Gwei转换为wei
            value: valueEth //像目标账户转账的金额 单位eth
        };

        try {
            transactionData['gas'] = await web3.eth.estimateGas(transactionData); //计算GAS
            const signedTx = await web3.eth.accounts.signTransaction(transactionData, private_key); //用私钥签名交易
            const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction); //发送交易
            if (txReceipt.status === true) {
                n++
                console.log(`向地址【${toAddress}】转账【${amount}】成功 第${n}条`)
            } 
        } catch(error) {
            //为了账户统一发生转账错误问题，发送失败后，不会重复发送交易到该账户
            //只需将未成功的地址在发送一次即可 将目标账户文件复制一份，检查失败的账户，单独发送 循环往复直到全部成功为止
            console.log(`向地址【${toAddress}】转账【${amount}】失败，信息:${error.message}`)
        }

        console.log(`----------------------------------------------`)
    }  

    console.log(`转账完成，开始检查接收方地址余额...`)

    //转账完成后检查地址余额
    for (let account in accounts) {
        await sleep(2000) 
        const currentBalance = await web3.eth.getBalance(account)
        const currentBalanceEth = web3.utils.fromWei(currentBalance, 'ether')
        console.log(`接收方地址【${account}】余额【${currentBalanceEth}】`)
    }

    console.log(`检查完成，任务执行完成`)
}

//调用函数
main();
