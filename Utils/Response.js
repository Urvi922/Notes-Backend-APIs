const retResp = (res,code,msg, data = null) =>{
    const response = {
        message: msg
    }
    if (data !== null) {
        response.data = data;
    }
    res.status(code).json(response); 
};

module.exports = retResp;