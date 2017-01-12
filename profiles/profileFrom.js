function profileFrom(body, file) {
    const profile = {
        name: body.name,
        email: body.email,
        phone: body.phone,

        slug: profileSlug(body.name)
    };

    if (file) {
        profile.pic = file.filename;
    }

    return profile;
}

function profileSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

module.exports = profileFrom;
