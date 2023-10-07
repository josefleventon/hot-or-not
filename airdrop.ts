import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { coin } from '@cosmjs/stargate'

export async function sendTokensFromFaucet(recipient: string) {
  try {
    const mnemonic = process.env.FAUCET_MNEMONIC!
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'neutron',
    })
    const [account] = await wallet.getAccounts()

    const rpcEndpoint = 'https://neutron-rpc.polkachu.com:443'

    const client = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      wallet,

      { gasPrice: GasPrice.fromString('0.25untrn') }
    )

    const res = await client.sendTokens(
      account.address,
      recipient,
      [
        coin(
          100000000,
          'factory/neutron1js3pkant5zgm954n3cq2wz0e4z03tvq927hnc3/uhackmos'
        ),
        coin(15000, 'untrn'),
      ],
      'auto'
    )
    return
  } catch (e) {
    console.error(e)
  }
}
