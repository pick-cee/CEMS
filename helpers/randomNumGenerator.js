const randomNumber = async () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return random.toString();
};

module.exports = {randomNumber}