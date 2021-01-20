module.exports = {
    toastSuccess: (toastRef, title, subtitle) => {
        toastRef.show({
            severity: 'success',
            summary: title,
            detail: subtitle,
            life: 10000
        })
    },

    toastError: (toastRef, title, subtitle) => {
        toastRef.show({
            severity: 'error',
            summary: title,
            detail: subtitle,
            life: 10000
        })
    }
}