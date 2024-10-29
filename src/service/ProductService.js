import axios from 'axios';

const app_id = process.env.VUE_APP_APP_ID
const api_key = process.env.VUE_APP_REST_API_KEY
const url = process.env.VUE_APP_URL
const db = process.env.VUE_APP_DB

export default class ProductService { 

    async getAPI() {
        return await axios.get(`${url}${db}`,
        {
            params: {
                'limit': '9999'
            },  
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        }).then(d => d.data.results)
    }   

    async createUser(user) {
        return await axios.post(`${url}${db}`, user,
        {
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        })
    }

    async updateUser(id, user) {
        return await axios.put(`${url}${db}` + id, user,
        {
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        })
    }

    async deleteUser(id) {
        return await axios.delete(`${url}${db}` + id, {
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        })
    }
    
    async getRecentShips() {
        return await axios.get(url + 'newShips',
        {
            params: {
                'limit': '999'
            },  
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        }).then(d => d.data.results)
    }

    async createNew(user) {
        return await axios.post(url + 'newShips', user,
        {
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        })
    }

    async deleteNew(id) {
        return await axios.delete(url + 'newShips/' + id, {
            headers: {
                'X-Parse-Application-Id': app_id,
                'X-Parse-REST-API-Key': api_key,
                'Content-Type': 'application/json'
            }
        })
    }

    getProducts() {
		return fetch('data/exp.json').then(res => res.json()).then(d => d.data);
    }

    getEhp() {
		return fetch('data/eHP120.json').then(res => res.json()).then(d => d.data);
    }

    getEhp125() {
		return fetch('data/eHP125.json').then(res => res.json()).then(d => d.data);
    }

    getNodes() {
		return fetch('data/nodes.json').then(res => res.json()).then(d => d.data);
    }
    
}
    