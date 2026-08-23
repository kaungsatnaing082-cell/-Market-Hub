exports.ok = (res, data={}, status=200) => res.status(status).json({ success:true, ...data });
exports.fail = (res, message="Request failed", status=400) => res.status(status).json({ success:false, message });
