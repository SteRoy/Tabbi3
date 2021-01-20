module.exports = {
    toastSuccess: (toastRef, title, subtitle) => {
        toastRef.current.show({
            severity: 'success',
            summary: title,
            detail: subtitle
        })
    },

    toastError: (toastRef, title, subtitle) => {
        toastRef.current.show({
            severity: 'error',
            summary: title,
            detail: subtitle
        })
    }
}