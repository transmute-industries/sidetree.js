import Element from './Element'
export default class ElementExplorer extends Element{
    async getTransactions(){
        const transactions = await this.transactionStore.getTransactions()
        return transactions
    }
    async getOperations(didUniqueSuffix: string){
        const operations = await this.operationStore.get(didUniqueSuffix)
        return operations
    }
}