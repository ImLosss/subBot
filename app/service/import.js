require('module-alias/register');

module.exports = (function() {
    return function(bot) {
        require('listeners/callback')(bot);
        require('listeners/renegadeImmortal')(bot);
    };
})();