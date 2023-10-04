const delay = async (t, val) =>
    new Promise((resolve) => setTimeout(resolve, t, val))

export default delay
