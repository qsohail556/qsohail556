class ExpressError extends Error{
    constructor(statusCode , message){
        super(message); // Pass the message to the parent Error class
        this.statusCode = statusCode;
        this.message = message;
    }
}
module.exports = ExpressError;