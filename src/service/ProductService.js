import axios from 'axios';

export default class ProductService { 

    async getAPI() {
        return await axios.get('https://parseapi.back4app.com/classes/Ships',
        {
            params: {
                'limit': '9999'
            },  
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
                'Content-Type': 'application/json'
            }
        }).then(d => d.data.results)
    }   

    async createUser(user) {
        return await axios.post('https://parseapi.back4app.com/classes/Ships', user,
        {
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
                'Content-Type': 'application/json'
            }
        })
    }

    async updateUser(id, user) {
        return await axios.put('https://parseapi.back4app.com/classes/Ships/' + id, user,
        {
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
                'Content-Type': 'application/json'
            }
        })
    }

    async deleteUser(id) {
        return await axios.delete('https://parseapi.back4app.com/classes/Ships/' + id, {
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
                'Content-Type': 'application/json'
            }
        })
    }
    
    async getRecentShips() {
        return await axios.get('https://parseapi.back4app.com/classes/newShips',
        {
            params: {
                'limit': '999'
            },  
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
                'Content-Type': 'application/json'
            }
        }).then(d => d.data.results)
    }

    async createNew(user) {
        return await axios.post('https://parseapi.back4app.com/classes/newShips', user,
        {
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
                'Content-Type': 'application/json'
            }
        })
    }

    async deleteNew(id) {
        return await axios.delete('https://parseapi.back4app.com/classes/newShips/' + id, {
            headers: {
                'X-Parse-Application-Id': 'FVZ1xLv1XJPKGMhzkVChd6j5F3RIt5R0bGGWZEnE',
                'X-Parse-REST-API-Key': 'jN4CWZNz0pHVDJSBhxYDyjJBLjZotFtLVoaD1Dp0',
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
    