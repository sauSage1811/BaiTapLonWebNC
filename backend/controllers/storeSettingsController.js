const storeSettingsModel = require("../models/storeSettingsModel");

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value) {
    if (!value) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidTime(value) {
    if (!value) {
        return true;
    }

    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function show(req, res) {
    try {
        const settings = await storeSettingsModel.getStoreSettings();

        res.json({
            success: true,
            data: settings || {
                id: 1,
                store_name: "",
                phone: "",
                address: "",
                contact_email: "",
                opening_time: "",
                closing_time: "",
                updated_at: null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Khong the tai thong tin cua hang"
        });
    }
}

async function update(req, res) {
    const payload = {
        store_name: normalizeText(req.body.store_name),
        phone: normalizeText(req.body.phone),
        address: normalizeText(req.body.address),
        contact_email: normalizeText(req.body.contact_email),
        opening_time: normalizeText(req.body.opening_time),
        closing_time: normalizeText(req.body.closing_time)
    };

    if (!payload.store_name) {
        return res.status(400).json({
            success: false,
            message: "Ten cua hang khong duoc de trong",
            errors: { store_name: "Ten cua hang khong duoc de trong" }
        });
    }

    if (payload.contact_email && !isValidEmail(payload.contact_email)) {
        return res.status(400).json({
            success: false,
            message: "Email lien he khong hop le",
            errors: { contact_email: "Email lien he khong hop le" }
        });
    }

    if (!isValidTime(payload.opening_time)) {
        return res.status(400).json({
            success: false,
            message: "Gio mo cua khong hop le",
            errors: { opening_time: "Gio mo cua phai co dinh dang HH:mm" }
        });
    }

    if (!isValidTime(payload.closing_time)) {
        return res.status(400).json({
            success: false,
            message: "Gio dong cua khong hop le",
            errors: { closing_time: "Gio dong cua phai co dinh dang HH:mm" }
        });
    }

    try {
        await storeSettingsModel.upsertStoreSettings(payload);
        const settings = await storeSettingsModel.getStoreSettings();

        res.json({
            success: true,
            message: "Cap nhat thong tin cua hang thanh cong",
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Khong the cap nhat thong tin cua hang"
        });
    }
}

module.exports = {
    show,
    update
};
