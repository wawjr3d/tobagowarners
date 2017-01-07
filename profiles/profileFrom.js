function profileFrom(body) {
    return {
        name: body.name,
        email: body.email,
        phone: body.phone,

        slug: profileSlug(body.name)
    };
}

function profileSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

module.exports = profileFrom;
