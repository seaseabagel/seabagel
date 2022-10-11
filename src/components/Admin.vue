<template>
    <Toast />
    <Toast position="bottom-right" group="br" />
    <div class="grid">
        <div class="col-12" v-if="isAuthenticated" >
            <div class="col-12">
                <div class="card">
                    <Toolbar class="mb-4">
                        <template #start>
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </template>
                        <template #end>
                            <Button label="Set as new" class="p-button-secondary mr-2" @click="setProducts" :disabled="!selectedProducts || !selectedProducts.length" />
                        </template>
                    </Toolbar>

                    <DataTable ref="dt" :value="products" v-model:selection="selectedProducts" dataKey="shipId" 
                        :paginator="true" :rows="10" :filters="filters" class="p-datatable-sm" 
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[10,25,50, products.length]"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products" responsiveLayout="scroll">
                        <template #header>
                            <div class="table-header flex flex-column md:flex-row md:justiify-content-between">
                                <h5 class="mb-2 md:m-0 p-as-md-center">Manage Table</h5>
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                                </span>
                            </div>
                        </template>

                        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                        <Column field="shipId" header="ID" :sortable="true" style="min-width:4rem"></Column>
                        <Column field="name_en" header="Name" :sortable="true" style="min-width:16rem"></Column>
                        <Column field="hullType" header="Rarity" :sortable="true" style="min-width:10rem"></Column>
                        <Column field="rarity" header="Rarity" :sortable="true" style="min-width:10rem">
                            <template #body="slotProps">
                                <span :class="'product-badge status-' + (slotProps.data.rarity ? slotProps.data.rarity.toLowerCase() : '')">{{slotProps.data.rarity}}</span>
                            </template>
                        </Column>
                        <Column field="nationality" header="Affiliation" :sortable="true" style="min-width:10rem"></Column>
                        <Column header="Collection">
                            <template #body="{data}">
                                <div class="flex align-items-center">
                                    <span class="image-text">{{addPlusSign(data.collectionBonus)}}</span>
                                    <img :src="'images/icons/' + data.collectionStat + '.png'" :title="data.collectionStat" :style="(data.collectionApplicable ? '' : 'display: none;')" />
                                    <span v-for="item of getBody(data.collectionApplicable)" :key='item'>
                                        <img :src="'images/icons/' + item + '.png'" :title="item" />
                                    </span>
                                </div>
                            </template>
                        </Column>
                        <Column header="Max level">
                            <template #body="{data}">
                                <div class="flex align-items-center">
                                    <span class="image-text">{{addPlusSign(data.maxLevelBonus)}}</span>
                                    <img :src="'images/icons/' + data.maxLevelStat + '.png'" :title="data.maxLevelStat" :style="(data.collectionApplicable ? '' : 'display: none;')" />
                                    <span v-for="item of getBody(data.maxLevelApplicable)" :key='item'>
                                        <img :src="'images/icons/' + item + '.png'" :title="item" />
                                    </span>
                                </div>
                            </template>
                        </Column>
                        <Column field="createdAt" header="Created At" :sortable="true" style="min-width:10rem">
                            <template #body="{data}">
                                {{formatDate(data.createdAt)}}
                            </template>
                        </Column>
                        <Column :exportable="false" style="min-width:8rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteProduct(slotProps.data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="col-12 xl:col-4">
                <div class="card">
                    <h5>Recent Ships</h5>
                    <Toolbar class="mb-4">
                        <template #start>
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteNewSelectedProducts" :disabled="!selectedSetNew || !selectedSetNew.length" />
                        </template>
                    </Toolbar>
                    <DataTable :value="products3" :rows="5" sortField="shipId" :sortOrder="1" v-model:selection="selectedSetNew" :paginator="true" responsiveLayout="scroll">

                        <Column selectionMode="multiple" style="width: 3rem"></Column>
                        <Column field="shipId" header="ID" :sortable="true"></Column>
                        <Column field="name" header="Name" :sortable="true"></Column>
                        <template #empty>
                            No new ships
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <div class="col-12" v-else>
            <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
                <div class="col-12 mt-5 xl:mt-0 text-center">
                    <img src="images/logo-dark.svg" alt="Logo" class="mb-5" style="width:81px; height:60px;">
                </div>
                <div class="col-12 xl:col-6" style="border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%);">
                    <div class="h-full w-full m-0 py-7 px-4" style="border-radius:53px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
                        <div class="grid flex flex-column align-items-center">
                            <div class="flex justify-content-center align-items-center bg-orange-500 border-circle" style="width:3.2rem; height:3.2rem;">
                                <i class="pi pi-fw pi-lock text-2xl text-50"></i>
                            </div>
                            <h1 class="text-900 font-bold text-4xl lg:text-5xl mb-2">Access Denied</h1>
                            <span class="text-600 text-center">You do not have the necesary permisions. Please contact admins.</span>
                            <img src="layout/images/asset-access.svg" alt="Access denied" class="mt-5" width="80%">
                            <div class="col-12 mt-5 text-center">
                                <i class="pi pi-fw pi-arrow-left text-blue-500 mr-2" style="vertical-align:center;"></i>
                                <router-link to="/" class="text-blue-500">Go to Dashboard</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="productDialog" :style="{width: '450px'}" header="Details" :modal="true" class="p-fluid" @keydown.enter="saveProduct"  @keydown.esc="hideDialog">
        <div class="field">
            <label for="Id">Id</label>
            <InputText id="Id" v-model.trim="product.shipId" required="true" autofocus :class="{'p-invalid': submitted && !product.shipId}" />
            <small class="p-error" v-if="submitted && !product.shipId">Id is required.</small>
        </div>
        
        <div class="field">
            <label for="Name">Name</label>
            <InputText id="Name" v-model.trim="product.name_en" required="true" autofocus :class="{'p-invalid': submitted && !product.name_en}" />
            <small class="p-error" v-if="submitted && !product.name_en">Name is required.</small>
        </div>

        <div class="field">
            <label for="Type" class="mb-3">Type</label>
            <Dropdown id="Type" v-model="product.hullType" required="true" :options="types" placeholder="Select a Type"/>
        </div>

        <div class="field">
            <label for="Rarity" class="mb-3">Rarity</label>
            <Dropdown id="Rarity" v-model="product.rarity" required="true" :options="rarities" placeholder="Select a Rarity">
                <template #value="slotProps">
                    <span :class="'product-badge status-' + (slotProps.value ? slotProps.value.toLowerCase() : '')">{{slotProps.value}}</span>
                </template>
                <template #option="slotProps">
                    <span :class="'product-badge status-' + (slotProps.option ? slotProps.option.toLowerCase() : '')">{{slotProps.option}}</span>
                </template>
            </Dropdown>
        </div>

        <div class="field">
            <label for="Affiliation" class="mb-3">Affiliation</label>
            <Dropdown :options="affiliations" v-model="product.nationality" :editable="true" placeholder="Select an Affiliation"/>
        </div>
        
        <div class="flex align-content-stretch flex-wrap">
            <div class="field">
                <label for="Tech points">collectionBonus</label>
                <InputText id="Tech points" v-model="product.collectionBonus"  />
            </div>
            <div class="field">
                <label for="Tech points">maxLevelBonus</label>
                <InputText id="Tech points" v-model="product.maxLevelBonus" />
            </div>
        </div>
        
        <div class="flex flex justify-content-around">
            <div class="field">
                <label class="mb-3">collectionStat</label>
                <div v-for="category of categories" :key="category" class="field-radiobutton">
                    <RadioButton :id="category" name="category" :value="category" v-model="product.collectionStat" />
                    <label :for="category">{{category}}</label>
                </div>
            </div>
            <div class="field">
                <label class="mb-3">maxLevelStat</label>
                <div v-for="category of categories" :key="category" class="field-radiobutton">
                    <RadioButton :id="category" name="category" :value="category" v-model="product.maxLevelStat" />
                    <label :for="category">{{category}}</label>
                </div>
            </div>
        </div>

        <div class="field">
            <label class="mb-3">collectionApplicable</label>
            <Dropdown :options="applicables" v-model="product.collectionApplicable" placeholder="Select stat">
                <template #option="slotProps">
                        <span v-for="item of getBody(slotProps.option)" :key='item'>
                            <img :src="'images/icons/' + item + '.png'" :title="item" style="margin-left: 0.4rem;" />
                        </span>
                </template>
            </Dropdown>
        </div>

        <div class="field">
            <label class="mb-3">maxLevelApplicable</label>
            <Dropdown :options="applicables" v-model="product.maxLevelApplicable" placeholder="Select stat">
                <template #option="slotProps">
                    <span v-for="item of getBody(slotProps.option)" :key='item'>
                        <img :src="'images/icons/' + item + '.png'" :title="item" style="margin-left: 0.4rem;" />
                    </span>
                </template>
            </Dropdown>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct"/>
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product">Are you sure you want to delete ship number <b>{{product.shipId}}</b>?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false"/>
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct(product.objectId)" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductsDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product">Are you sure you want to delete <b>{{selectedProducts.length}}</b> selected ships?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false"/>
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
        </template>
    </Dialog>

    <Dialog v-model:visible="setNewDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product">Are you sure you want to set <b>{{selectedProducts.length}}</b> ships as new?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="setNewDialog = false"/>
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteNewSelectedProducts" />
        </template>
    </Dialog>
</template>

<script>
import { FilterMatchMode } from 'primevue/api';
import ProductService from '../service/ProductService';
import { useAuth0 } from '@auth0/auth0-vue';

export default {
    setup() {
      const { isAuthenticated } = useAuth0();

      return {
        isAuthenticated
      };
    },
    data() {
        return {
            ships: [],
            categories: [],
            Date: null,
            products: [],
            productDialog: false,
            deleteProductDialog: false,
            deleteProductsDialog: false,
            setNewDialog: false,
            product: {},
            selectedSetNew: null,
            selectedProducts: null,
            filters: {},
            submitted: false,
            types: [],
            applicables: [],
            rarities: [],
            affiliations: [],
            products3: []
        }
    },
    productService: null,
    created() {
        this.productService = new ProductService();
        this.fetchData();
        this.initFilters();
    },
    mounted() {
        this.unpackTypes();
    },
    methods: {
		addPlusSign(data){
			return data !== null ? '+ ' + data : null
		},
        formatDate(date){
            const obj = new Date(date);
            return obj.toLocaleString()
        },
        unpackTypes(){
            var chartsData = JSON.parse(localStorage.getItem('chartsData'));
            this.affiliations = Object.keys(chartsData[0]);
            this.rarities = Object.keys(chartsData[1]);
            this.types = Object.keys(chartsData[2]);
            this.categories = Object.keys(chartsData[4]);
            this.applicables = Object.keys(chartsData[9]);
        },
		getBody(code){
			if(code){
				if(code.includes('.')){
					return code.replace(/"/g, "").split(".")
				}
				return code.replace(/"/g, "").split(",")
			}
			if(code === 'null') {
				return null
			}
		},
        fetchData(){
            if(this.isAuthenticated){
                this.productService.getAPI().then(data => this.products = data);
                this.productService.getRecentShips().then(data => { this.products3 = data });
            }
        },
        getOut(){
            this.$router.push(this.$route.query.redirect || '/');
        },
        currentDate(){
            var now = new Date();
            var options = { day: 'numeric', month: 'numeric', year: 'numeric' };
            var current = (now.toLocaleString("en-GB", options) + "");
            return current;
        },
        localDate(x){
            var options = { day: 'numeric', month: 'numeric', year: 'numeric' };
            var locale = (x.toLocaleString("en-GB", options) + "");
            return locale;
        },
        openNew() {
            this.product = {};
            this.submitted = false;
            this.productDialog = true;
        },
        hideDialog() {
            this.productDialog = false;
            this.submitted = false;
        },
        saveProduct() {
            this.submitted = true;

			if (this.product.name_en.trim()) {
                if (this.findIndexById(this.product.shipId) !== -1) {
                    this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Product Updated', life: 3000});
                    this.product.shipId = this.product.shipId - 0
                    this.product.rarity = this.product.rarity.value ? this.product.rarity.value : this.product.rarity;
                    this.product.hullType = this.product.hullType.value ? this.product.hullType.value : this.product.hullType;
                    this.product.nationality = this.product.nationality.value ? this.product.nationality.value : this.product.nationality;
                    this.product.collectionStat = this.product.collectionStat ? this.product.collectionStat : null;
                    this.product.maxLevelStat = this.product.maxLevelStat ? this.product.maxLevelStat : null;
                    this.product.collectionBonus = this.product.collectionBonus ? this.product.collectionBonus : null;
                    this.product.maxLevelBonus = this.product.maxLevelBonus ? this.product.maxLevelBonus : null;
                    this.product.collectionApplicable = this.product.collectionApplicable ? this.product.collectionApplicable : null;
                    this.product.maxLevelApplicable = this.product.maxLevelApplicable ? this.product.maxLevelApplicable : null;
                    this.productService.updateUser(this.product.objectId, {
                        shipId:this.product.shipId,
                        name_en:this.product.name_en,
                        rarity:this.product.rarity,
                        hullType:this.product.hullType,
                        nationality:this.product.nationality,
                        collectionStat:this.product.collectionStat,
                        maxLevelStat:this.product.maxLevelStat,
                        collectionBonus:this.product.collectionBonus,
                        maxLevelBonus:this.product.maxLevelBonus,
                        collectionApplicable:this.product.collectionApplicable,
                        maxLevelApplicable:this.product.maxLevelApplicable,
                        level:0
                    })//.then((response) => {console.log(response);}, (error) => {console.log(error);});
                    this.products[this.findIndexById(this.product.shipId)] = this.product;
                }
                else {
                    this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Product Created', life: 3000});
                    this.product.shipId = this.product.shipId - 0
                    this.product.rarity = this.product.rarity.value ? this.product.rarity.value : this.product.rarity;
                    this.product.hullType = this.product.hullType.value ? this.product.hullType.value : this.product.hullType;
                    this.product.nationality = this.product.nationality.value ? this.product.nationality.value : this.product.nationality;
                    this.product.collectionStat = this.product.collectionStat ? this.product.collectionStat : null;
                    this.product.maxLevelStat = this.product.maxLevelStat ? this.product.maxLevelStat : null;
                    this.product.collectionBonus = this.product.collectionBonus ? this.product.collectionBonus : null;
                    this.product.maxLevelBonus = this.product.maxLevelBonus ? this.product.maxLevelBonus : null;
                    this.product.collectionApplicable = this.product.collectionApplicable ? this.product.collectionApplicable : null;
                    this.product.maxLevelApplicable = this.product.maxLevelApplicable ? this.product.maxLevelApplicable : null;
                    this.productService.createUser({
                        shipId:this.product.shipId,
                        name_en:this.product.name_en,
                        rarity:this.product.rarity,
                        hullType:this.product.hullType,
                        nationality:this.product.nationality,
                        collectionStat:this.product.collectionStat,
                        maxLevelStat:this.product.maxLevelStat,
                        collectionBonus:this.product.collectionBonus,
                        maxLevelBonus:this.product.maxLevelBonus,
                        collectionApplicable:this.product.collectionApplicable,
                        maxLevelApplicable:this.product.maxLevelApplicable,
                        level:0
                    });
                    this.products.push(this.product);
                }
                this.productDialog = false;
                this.product = {};
                this.$forceUpdate();
            }
            else{
                this.preventDefault();
            }
        },
        setProduct(code, name) {
			if (this.selectedProducts.length > 0) {
                code = code - 0
                if(this.findNewIndexById(code) == -1){
                    this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Product Added', life: 3000});
                    this.productService.createNew({
                        shipId:code + '',
                        name:name
                    })
                }
                else{
                    this.$toast.add({severity:'error', summary: 'Error Message', detail:'Ship is set already', life: 3000});
                }
            }
        },
        findNewIndexById(code) {
            let index = -1;
            for (let i = 0; i < this.products3.length; i++) {
                if (this.products3[i].shipId === code) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        editProduct(product) {
            this.product = {...product};
            this.productDialog = true;
        },
        confirmDeleteProduct(product) {
            this.product = product;
            this.deleteProductDialog = true;
        },
        deleteProduct(id) {
            this.products = this.products.filter(val => val.shipId !== this.product.shipId);
            this.deleteProductDialog = false;
            this.productService.deleteUser(id);
            this.product = {};
            this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Product Deleted', life: 3000});    
        },
        deleteNewProduct(id) {
            this.products3 = this.products3.filter(val => val.shipId !== this.product.shipId);
            this.productService.deleteNew(id);
            this.product = {};
            this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Product Deleted', life: 3000});    
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.products.length; i++) {
                if (this.products[i]['shipId'] === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        exportCSV() {
            this.$refs.dt.exportCSV();
        },
        isPositiveInteger(val) {
            let str = String(val);
            str = str.trim();
            if (!str) {
                return false;
            }
            str = str.replace(/^0+/, "") || "0";
            var n = Math.floor(Number(str));
            return n !== Infinity && n <= 2 && String(n) === str && n >= 0;
        },
        confirmDeleteSelected() {
            this.deleteProductsDialog = true;
        },
        deleteSelectedProducts() {
            this.products = this.products.filter(val => !this.selectedProducts.includes(val));
            var i;
            for (i = 0; i < this.selectedProducts.length; i++) {
                this.deleteProduct(this.selectedProducts[i].objectId);
            }
            this.deleteProductsDialog = false;
            this.selectedProducts = null;
        },
        confirmSetSelected() {
            this.setNewDialog = true;
        },
        deleteNewSelectedProducts() {
            var i;
            for (i = 0; i < this.selectedSetNew.length; i++) {
                this.deleteNewProduct(this.selectedSetNew[i].objectId);
            }
            this.selectedSetNew = null;
        },
        setProducts() {
            var i;
            for (i = 0; i < this.selectedProducts.length; i++) {
                this.setProduct(this.selectedProducts[i].shipId, this.selectedProducts[i].name_en);
            }
            this.selectedProducts = null;
        },
        initFilters() {
            this.filters = {
                'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
            }
        }
    }
}
</script>

<style lang="scss" scoped>
img {
    vertical-align: middle;
    margin-left: 0.4rem;
}
.table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media screen and (max-width: 960px) {
        align-items: start;
	}
}
.product-badge {
    border-radius: 2px;
    padding: .25em .5rem;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: .3px;
}
.product-image {
    width: 50px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.p-dialog .product-image {
    width: 50px;
    margin: 0 auto 2rem auto;
    display: block;
}

.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
@media screen and (max-width: 960px) {
	::v-deep(.p-toolbar) {
		flex-wrap: wrap;
        
		.p-button {
            margin-bottom: 0.25rem;
        }
	}
}.product-badge.status-normal {
    background-color: #dee2e6;
    color: #23547b;
}
.product-badge.status-rare {
    background-color: #9FE8FF;
    color: #23547b;
}
.product-badge.status-elite {
    background-color: #C4ADFF;
    color: #694382;
}
.product-badge.status-super {
    background-color: #EE9;
    color: #8a5340;
}
.product-badge.status-priority {
    background-color: #EE9;
    color: #8a5340;
}
.product-badge.status-ultra {
    background: linear-gradient(120deg,#fbffca,#baffbf,#a7efff,#ffabff) !important;
    color: #23547b;
}
.product-badge.status-decisive {
    background: linear-gradient(120deg,#fbffca,#baffbf,#a7efff,#ffabff) !important;
    color: #23547b;
}
</style>