module.exports = {
    /**
     * 
     * @param {Object} data
     * @param {Boolean} success
     * @param {Number} errorcode
     * 
     * default setting
     * data = {}, success = true, errorcode = -1
     * 
     * return Json String
     */
    Model: function(data = {}, success = true, errorcode = -1) {
        this.data = data;
        this.success = success;
        this.errorcode = errorcode;

        return JSON.stringify(this)
    }

}