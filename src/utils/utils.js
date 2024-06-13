function sanitizeText(text) {
    return text.replace(/[^ -~\w@#$%^&*()_+={}[\]:;<>,.?/~\\-ÀàÁáÂâÄäÇçÈèÉéÊêËëÌìÍíÎîÏïÑñÒòÓóÔôÕõÖöŠšÙùÚúÛûÜüÝýŸÿŽž]/g, '').trim();
}

module.exports = { sanitizeText };
