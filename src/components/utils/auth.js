export const getUserFromLocalStorage = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user && user.id ? user : null;
    } catch (e) {
        return null;
    }
};
