import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "https://e-commerce-website-18po-53r5n7eog-bassantmahers-projects.vercel.app",
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;
