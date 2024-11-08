require('module-alias/register');

module.exports = (function() {
    return function(bot) {
        require('listeners/setupClient')(bot);
        require('listeners/commandHandler')(bot);
        // require('listeners/renegadeImmortal')(bot);
    };
})();