var isAdmin = function(member) {
    return member.hasPermission('ADMINISTRATOR');
};

module.exports = {
    isAdmin: isAdmin
};