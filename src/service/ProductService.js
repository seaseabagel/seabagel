import axios from 'axios';

export default class ProductService {

    getAPI() {
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              authorization: 'Bearer rnd_dgYMKHaz1w6ziM0n1Yvz4s1JTu6Y'
            }
          };
          
        fetch('https://api.render.com/v1/services?limit=20', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
    }

    getProducts() {
		return fetch('data/products.json').then(res => res.json()).then(d => d.data);
    }
    
    getShips() { //temp, replaces getProducts()
		return fetch('data/ships.json').then(res => res.json()).then(d => d.data);
    }

    getProductsSmall() {
        return fetch('http://localhost/data/read.php')
        .then(res => res.json());
    }

    getNew() {
        return fetch('http://localhost/data/new_read.php')
        .then(res => res.json());
    }

    getNewSmall() { //temp, replaces getNew()
        return fetch('data/newShips.json')
        .then(res => res.json()).then(d => d.data);
    }

    createUser(user){
        return axios.post('http://localhost/data/create.php', user);
    }

    updateUser(user){
        return axios.put('http://localhost/data/update.php', user);
    }
    
    deleteUser(id){
        axios.delete('http://localhost/data/delete.php', { params: { _code: id } })
    }

    createNew(user){
        return axios.post('http://localhost/data/new_create.php', user);
    }
    
    deleteNew(id){
        axios.delete('http://localhost/data/new_delete.php', { params: { Code: id } })
    }
    
}
    