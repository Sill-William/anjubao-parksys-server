export class OperationFactory {

  static async doOperInCtr(fn: () => Promise<void>) {
    try {
      await fn()
      return {
        attached: true
      }
    } catch (e) {
      console.debug(e)
      return {
        attached: false 
      }
    }
  }

}