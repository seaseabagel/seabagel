<template>
	<Toast />
	<Toast position="bottom-right" group="br" />
	<ConfirmDialog/>
	<div>
		<!-- Hidden area for rendering tables -->
		<div ref="tablesContainer" class="tables-container">
			<div v-for="(products, nationality) in filteredGroupedShips" :key="nationality"
			class="nationality-table" :style="getNationalityStyle()">
			<h3 :style="getNationalityHeaderStyle(nationality)">{{ nationality }}</h3>
			<table>
				<thead>
					<tr>
					<th>Ship</th>
					<th>Rarity</th>
					<th>120 Stat</th>
					</tr>
				</thead>
			<tbody>
				<tr v-for="ship in products" :key="ship.name_en">
					<td :style="getShipNameStyle(nationality)">{{ ship.name_en }}</td>
					<td :style="getBorderStyle(nationality, ship)">{{ ship.rarity }}</td>
					<td :style="getBorderStyle(nationality, ship)">
						<img 
							:src="getStatIcon(ship.maxLevelStat)" 
							:alt="ship.maxLevelStat"
							class="stat-icon"
						/>
					</td>
				</tr>
			</tbody>
			</table>
			</div>
		</div>
	</div>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<h5 class="flex p-1">Manage Fleet Tech</h5>
				<DataTable id="dt" ref="dt" stripedRows :sortField="dtSortField" :sortOrder="1" :value="products" :loading="loading" editMode="cell" :class="tableClass" v-model:filters="filters"
					v-model:selection="selectedProducts" :metaKeySelection="false" :paginator="true" :rows="10" :rowsPerPageOptions="[10,25,50, products.length]"
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
					responsiveLayout="scroll" :filterDisplay="filterDisplayValue" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ships" >
					<template #header>
						<div class="flex align-items-center">
							<span class="p-input-icon-left flex align-items-center">
								<i class="pi pi-search" />
								<InputText style="max-width: 14rem" v-model="filters['global'].value" placeholder="Keyword Search" />
							</span>
							<Button label="Edit" icon="pi pi-pencil" class="p-button-danger" @click="confirmChangeSelected" :disabled="!selectedProducts || !selectedProducts.length" style="margin-left: 0.4rem;" />
							<span class="ml-auto done" v-tooltip.top="'Counting ships that contribute to fleet tech'">{{percent}}/{{filterLength}} done</span>
							<SplitButton label="Clear" icon="pi pi-filter-slash" @click="clearFilter()" :model="items" class="p-button-warning p-1" />
						</div>
					</template>
					<Column selectionMode="multiple" style="width: 3rem" />
					<Column field="shipId" header="ID" :sortable="true" />
					<Column field="name_en" header="Name" :sortable="true">
						<template #filter>
							<InputText type="text" v-model="filters['name_en'].value" class="p-column-filter" :placeholder="`Search by name - `" style="min-width: 9rem;" />
						</template>
						<template #body="{data}">
							<span><a :style="isDark()" :href="'https://azurlane.koumakan.jp/wiki/'+data.name_en">{{data.name_en}}</a></span>
						</template>
					</Column>
					<Column field="hullType" header="Type" :showFilterMenu="false" :sortable="true" style="min-width:12rem">
						<template #filter="{filterModel,filterCallback}">
							<MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="types" placeholder="Any">
								<template #option="slotProps">
									<span>{{slotProps.option}}</span>
								</template>
							</MultiSelect>
						</template>
					</Column>
					<Column field="rarity" header="Rarity" :showFilterMenu="false" :sortable="true" style="min-width:12rem">
						<template #body="slotProps">
							<span :class="' product-badge status-' + (slotProps.data.rarity ? slotProps.data.rarity.toLowerCase() : '')">{{slotProps.data.rarity}}</span>
						</template>
						<template #filter="{filterModel,filterCallback}">
							<MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="rarities" placeholder="Any">
								<template #option="slotProps">
									<span :class="'product-badge status-' + slotProps.option.toLowerCase()">{{slotProps.option}}</span>
								</template>
							</MultiSelect>
						</template>
					</Column>
					<Column field="nationality" header="Affiliation" filterField="nationality" :showFilterMenu="false" :showFilterMatchModes="false" :sortable="true">
						<template #body="{data}">
							<span>{{data.nationality}}</span>
						</template>
						<template #filter="{filterModel,filterCallback}">
							<MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="affiliations" placeholder="Any">
								<template #option="slotProps">
									<span>{{slotProps.option}}</span>
								</template>
							</MultiSelect>
						</template>
					</Column>
					<Column :hidden="collHidden" header="Collection" filterField="collectionStat">
						<template #body="{data}">
							<div class="flex align-items-center">
								<span class="image-text">{{addPlusSign(data.collectionBonus)}}</span>
								<img :src="'images/icons/' + data.collectionStat + '.png'" :title="data.collectionStat" @click="showTech('collectionStat', data.collectionStat)" :style="(data.collectionApplicable ? '' : 'display: none;')" />
								<span v-for="item of getBody(data.collectionApplicable)" :key='item'>
									<img :src="'images/icons/' + item + '.png'" :title="item" @click="showTech('collectionApplicable', item)" style="height: 2.1rem" />
								</span>
							</div>
						</template>
					</Column>
					<Column header="Max level" filterField="maxLevelApplicable">
						<template #body="{data}">
							<div class="flex align-items-center">
								<span class="image-text">{{addPlusSign(data.maxLevelBonus)}}</span>
								<img :src="'images/icons/' + data.maxLevelStat + '.png'" :title="data.maxLevelStat" @click="showTech('maxLevelStat', data.maxLevelStat)" :style="(data.collectionApplicable ? '' : 'display: none;')" />
								<span v-for="item of getBody(data.maxLevelApplicable)" :key='item'>
									<img :src="'images/icons/' + item + '.png'" :title="item" @click="showTech('maxLevelApplicable', item)" style="height: 2.1rem" />
								</span>
							</div>
						</template>
					</Column>
					<Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field" dataType="numeric" sortable filterField="level">
						<template #body="slotProps">
							<span :class="levelClass(slotProps.data)">
								{{slotProps.data.level}}
							</span>
						</template>
						<template #editor="{ data, field }">
							<InputText @change="saveCats(data[field], data.shipId)" v-model="data[field]" />
						</template>
						<template #filter="{filterModel}">
							<Dropdown v-model="filterModel.value" @change="filterLevels(filterModel.value.min, filterModel.value.max)" :options="levelFilters" placeholder="Any">
								<template #option="slotProps">
									<span>{{slotProps.option.field}}</span>
								</template>
							</Dropdown>
						</template>
					</Column>
				</DataTable>
			</div>
		</div>
		<div class="col-12 xl:col-8">
			<div class="card">
				<h5>Recent Ships</h5>
				<DataTable :loading="loadingRecent" editMode="cell" :value="fullRecentProducts" :rows="5" sortField="shipId" :sortOrder="1" :paginator="true" responsiveLayout="scroll">
					<Column field="name_en" header="Name" :sortable="true" />
					<Column field="hullType" header="Type" :sortable="true" />
					<Column field="rarity" header="Rarity" :sortable="true" style="width: 9rem;">
						<template #body="slotProps">
							<span :class="' product-badge status-' + (slotProps.data.rarity ? slotProps.data.rarity.toLowerCase() : '')">{{slotProps.data.rarity}}</span>
						</template>
					</Column>
					<Column field="nationality" header="Affiliation" :sortable="true" />
					<Column field="level" header="Level" :sortable="true" >
						<template #body="slotProps">
							<div :class="levelClass(slotProps.data)">
								{{slotProps.data.level}}
							</div>
						</template>
						<template #editor="{ data }">
							<InputText @change="saveCats(data.level, data.shipId)" v-model="data.level" />
						</template>
					</Column>
						<template #empty>
							No new ships
						</template>
				</DataTable>
			</div>

			<div class="card">
				<DataTable :value="exp" responsiveLayout="scroll">
					<Column v-for="col of expColumns" :field="col.field" :key="col.field" :header="col.header"/>
				</DataTable>
			</div>
		</div>
		<div class="col-12 xl:col-4">
			<div class="card">
				<h5>Doughnut Chart</h5>
				<div class="flex flex-column align-items-center">
					<Chart ref="dghntChrt" type="doughnut" :data="chartData" :options="lightOptions" />
				</div>
			</div>
		</div>
		<div class="col-12 xl:col-6">
			<Card class="card">
				<template v-slot:title>
					<div class="flex align-items-center justify-content-between mb-0">
						<h5>Collection Tech Bonus</h5>
						<Button icon="pi pi-plus" class="p-button-text" @click="changeReturnValue"/>
					</div>
				</template>
				<template v-slot:content>
					<div class="card">
						<h5>{{returnValueLabel}}</h5>
						<DataTable :value="products1" class="p-datatable-sm" stripedRows showGridlines responsiveLayout="scroll" >
							<Column field="type" style="width:2rem;">
								<template #body="{data}">
									<img :src="'images/icons/' + data.type + '.png'" @click="showTech('collectionApplicable', data.type)" :title="data.type" class="table-img" />
								</template>
							</Column>
							<Column v-for="col of techColumns" :field="col.field" :key="col.field" bodyStyle="text-align: center; padding: 0; margin: 0;" >
								<template #header>
									<img :src="'images/icons/' + col.header + '.png'" @click="showTech('collectionStat', col.header)" :title="col.header" class="table-img" />
								</template>
								<template #body="{data}">
									{{returnData(data[col.header], returnValue)}}
								</template>
							</Column>
						</DataTable>
					</div>
				</template>
			</Card>
		</div>
		<div class="col-12 xl:col-6">
			<Card class="card">
				<template v-slot:title>
					<div class="flex align-items-center justify-content-between mb-0">
						<h5>Max Level Tech Bonus</h5>
						<Button icon="pi pi-plus" class="p-button-text" @click="changeReturnValueMax"/>
					</div>
				</template>
				<template v-slot:content>
					<div class="card">
						<h5>{{returnValueLabelMax}}</h5>
						<DataTable :value="chartsDataProducts" class="p-datatable-sm" stripedRows showGridlines responsiveLayout="scroll" >
							<Column field="type" style="width:2rem;">
								<template #body="{data}">
									<img :src="'images/icons/' + data.type + '.png'" @click="showTech('maxLevelApplicable', data.type)" :title="data.type" class="table-img" />
								</template>
							</Column>
							<Column v-for="col of techColumns" :field="col.field" :key="col.field" bodyStyle="text-align: center; padding: 0; margin: 0;">
								<template #header>
									<img :src="'images/icons/' + col.header + '.png'" @click="showTech('maxLevelStat', col.header)" :title="col.header" class="table-img" />
								</template>
								<template #body="{data}" >
									{{returnData(data[col.header], returnValueMax)}}
								</template>
							</Column>
						</DataTable>
					</div>
				</template>
			</Card>
		</div>
		<div class="col-12 lg:col-7">
			<div class="card">
				<h5 class="align-self-start">Bar Chart</h5>
				<Chart ref="brChrt" type="bar" :data="basicData" :options="horizontalOptions" />
			</div>

			<div class="grid">
				<div class="col-12 md:col-6">
					<div class="card">
						<h5>Import</h5>
						<input style="display:none" type="file" accept=".csv" @change="onFileSelected" ref="fileInput">
						<Button icon="pi pi-upload" label="Choose" @click="$refs.fileInput.click()" />
						<h5>Export</h5>
						<Button icon="pi pi-upload" label="Download" @click="CSVExport" />
					</div>
				</div>	
				<div class="col-12 md:col-6">
					<div class="card">
						<h5>Credit</h5>
						<h7><a href="https://azurlane.koumakan.jp/">Data was taken from AL wiki</a></h7>
					</div>	
					<div class="card">
						<h5>Create image</h5>
						<Button :label="isGenerating ? 'Generating...' : 'Generate all'" @click="generateImage(true)" :disabled="isGenerating" />
						<Button :label="isGeneratingHighlighted ? 'Generating...' : 'Generate with my fleet tech'" @click="generateHighlightedImage(false)" class="ml-2" :disabled="isGeneratingHighlighted"/>
					</div>	
				</div>
			</div>
		</div>

		<div class="col-12 lg:col-5">
			<div class="card">
				<h5 class="align-self-start">Radar Area Chart</h5>
				<Chart ref="rdrChrt" type="radar" :data="normalData" :options="normalOptions" />
			</div>
		</div>

	</div>

	<Dialog v-model:visible="changeProductsDialog" :style="{width: '450px'}" header="Ship Details" :modal="true" class="p-fluid" @keydown.enter="changeSelectedProducts(confirmLevel)" @keydown.esc="changeProductsDialog = false">
		<img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" :alt="product.image" class="product-image" v-if="product.image" />
		<div class="field">
			<label for="level">Level</label>
			<InputText id="level" v-model.trim="confirmLevel" required="true" autofocus :class="{'p-invalid': !confirmLevel}" />
			<small class="p-error" v-if=" !confirmLevel">Number is required.</small>
		</div>
		<div class="confirmation-content">
			<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
			<span v-if="product">Are you sure you want to change the selected ships?</span>
		</div>
		<template #footer>
			<Button label="No" icon="pi pi-times" class="p-button-text" @click="changeProductsDialog = false" />
			<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="changeSelectedProducts(confirmLevel)" />
		</template>
	</Dialog>
</template>

<script>

import ProductService from '../service/ProductService';
import {FilterMatchMode, FilterOperator} from 'primevue/api';
import EventBus from '../AppEventBus';
import { Buffer } from 'buffer';
import pako from 'pako';
import html2canvas from "html2canvas";

export default {
	data() {
		return {
			isGenerating: false,
			isGeneratingHighlighted: false,
			highlightLevel: false,
			nationalityColors: {
				"Eagle Union": "\#a9e2f3",
				"Royal Navy": "\#d0a9f5",
				"Sakura Empire": "\#f781d8",
				"Iron Blood": "\#fa5882",
				"Northern Parliament": "\#819ff7",
				"Iris Libre": "\#ffd192",
				"Vichya Dominion": "\#ffb4b4",
				"Dragon Empery": "\#c4adff",
				"Tempesta": "\#89bf8e",
				"Sardegna Empire": "\#98fb98",
				"META": "\#222222",
			},
			hiddenLabel: 0,
			dtSortField: null,	
			API: null,
			collHidden: null,
			userSettings: {},
			returnValueLabel: 'My ships',
			returnValueLabelMax: 'My ships',
			returnValue: 0,
			returnValueMax: 0,
			chartData: {},
			normalData: {},
			basicData: {},
			filterLength: null,
			exp: null,
			shipgirls: null,
			products: [],
			product: {},
			products1: null,
			chartsDataProducts: null,
			recentProducts: [],
			fullRecentProducts: [],
			columns: null,
			expColumns: null,
			techColumns: null,
			checked: true,
			tableClass: "p-datatable-sm",
			filterDisplayValue: 'row',
			changeProductsDialog: false,
			percent: null,
			selectedProducts: null,
			items: [
				{
					label: 'Update',
					icon: 'pi pi-refresh',
					command: () => {
						this.updateData();
					}
				},
				{
					label: 'Show hidden ships',
					icon: 'pi pi-plus',
					command: () => {
						this.changeHiddenLabel();
					}
				},
				{
					label: 'Hide collection',
					icon: 'pi pi-minus',
					command: () => {
						this.changeColl(this.collHidden);
					}
				},
				{
					label: 'Change filter look',
					icon: 'pi pi-filter',
					command: () => {
						this.changeFilterDisplay();
					}
				},
				{
					label: 'Change table look',
					icon: 'pi pi-th-large',
					command: () => {
						this.changeTableDisplay();
					}
				},
				{
					label: 'Delete my data',
					icon: 'pi pi-times',
					command: () => {
						this.clearData();
					}
				}
			],
			confirmLevel: null,
			localStorage: null,
			loading: false,
			loadingRecent: false,
			loadingColl: false,
			loadingMax: false,
			cats: {},
			realData: [],
			levelFilters: null,
			filters: {
				'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'name_en': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'rarity': {value: null, matchMode: FilterMatchMode.IN},
				'hullType': {value: null, matchMode: FilterMatchMode.IN},
				'nationality': {value: null, matchMode: FilterMatchMode.IN},
				'collectionStat': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'collectionBonus': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'maxLevelApplicable': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'collectionApplicable': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'maxLevelBonus': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'maxLevelStat': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'level': {value: null, matchMode: FilterMatchMode.EQUALS}
			},
			types: [],
			rarities: [],
			affiliations: [],
			labelColor: null,
			lightOptions: {
				plugins: {
					legend: {
						labels: {
							color: this.label()
						}
					},
					title: {
						display: true,
						text: 'Chart by levels',
						color: this.label()
					}
				}
			},
			horizontalOptions: {
				indexAxis: 'y',
				plugins: {
					legend: {
						labels: {
							color: this.label()
						}
					},
					title: {
						display: true,
						text: 'Max level progress',
						color: this.label()
					}
				},
				scales: {
					x: {
						ticks: {
							color: this.label()
						},
						grid: {
							color: '#ebedef'
						}
					},
					y: {
						ticks: {
							color: this.label()
						},
						grid: {
							color: '#ebedef'
						}
					}
				}
			},
			normalOptions: {
				plugins: {
					legend: {
						labels: {
							color: this.label()
						}
					},
					tooltip: true,
					title: {
						display: true,
						text: 'Tech bonus progress',
						color: this.label()
					}
				},
				scales: {
					r: {
						pointLabels: {
							color: this.label(),
							font: {
								size: 12
							}
						},
						grid: {
							color: '#ebedef',
						},
						angleLines: {
							color: '#ebedef'
						}
					}
				},
				elements: {
					point: {
						hoverRadius: 10,
					}
				}
			}
		}
	},
	productService: null,
	created() {
		this.productService = new ProductService();
	},
	themeChangeListener: null,
	beforeUnmount() {
		EventBus.off('theme-change', this.themeChangeListener);
	},
	mounted() {
		this.themeChangeListener = () => {
			this.refreshOptions()
		};
		EventBus.on('theme-change', this.themeChangeListener);
		this.loading = true
		this.loadingRecent = true
		this.columns = [
			{field: 'level', header: 'Level'}
		];
		this.techColumns = [
			//{field: 'type', header: ''},
			{field: 'health', header: 'health'},
			{field: 'firepower', header: 'firepower'},
			{field: 'aviation', header: 'aviation'},
			{field: 'reload', header: 'reload'},
			{field: 'accuracy', header: 'accuracy'},
			{field: 'antiair', header: 'antiair'},
			{field: 'torpedo', header: 'torpedo'},
			{field: 'evasion', header: 'evasion'},
			{field: 'antisubmarineWarfare', header: 'antisubmarineWarfare'},
		];
		this.expColumns = [
			{field: 'type', header: 'EXP'},
			{field: '100-105', header: '100→105'},
			{field: '105-110', header: '105→110'},
			{field: '110-115', header: '110→115'},
			{field: '115-120', header: '115→120'},
			{field: '100-120', header: '100→120'},
			{field: '120-125', header: '120→125'}
		];
		this.levelFilters = [
			{field: 'Collection', min: '0', max: '69'},
			{field: 'Max limit break', min: '70', max: '100'},
			{field: 'Is actively in progress', min: '101', max: '119'},
			{field: 'Done', min: '120', max: '125'}
		];
		this.welcomeGuest();
		this.productService.getRecentShips().then(data => {
			this.recentProducts = data
		});
		this.productService.getProducts().then(data => {this.exp = data});
		this.productService.getAPI().then(data => {
			this.products = this.realData = data
			this.sortData()
			this.verifyAllProducts()
			this.afterImport()
			this.checkData()
			this.fetchData()
			this.doSettings()
			this.levels()
			this.getNewShips()
		});
	},
	computed: {
		groupedShips() {
			return this.products.reduce((groups, ship) => {
				if (!groups[ship.nationality]) groups[ship.nationality] = [];
				groups[ship.nationality].push(ship);
				return groups;
			}, {});
		},
		filteredGroupedShips() {
			const targetStats = ['accuracy', 'firepower', 'reload', 'aviation'];

			// First, filter out ships which do not have maxLevelStat in targetStats
			const filteredProducts = this.products.filter(product => 
				targetStats.includes(product.maxLevelStat)
			);

			// Then, group the filtered products by nationality
			return filteredProducts.reduce((groups, ship) => {
				if (!groups[ship.nationality]) groups[ship.nationality] = [];
				groups[ship.nationality].push(ship);
				return groups;
			}, {});
		}
	},
	methods: {
		getStatIcon(stat) {
			const iconMap = {
			accuracy: 'accuracy',
			firepower: 'firepower',
			reload: 'reload',
			aviation: 'aviation'
			};
			return `images/icons/${iconMap[stat]}.png`;
		},
		getNationalityStyle() {
			return {
				margin: "10px 0",
				padding: "10px",
				backgroundColor: "white"
			};
		},
		getBorderStyle(nationality, ship) {
			const color = this.nationalityColors[nationality] || "white";
			const style = {
				borderBottom: `3px solid ${this.highlightLevel && ship.level >= 120 ? 'white' : color}`,
				borderLeft: '4px solid white',	
				verticalAlign: 'middle',
			};
			if (this.highlightLevel && ship.level >= 120) {
				style.backgroundColor = '#00FF0044';
			}
			return style;
		},
		getNationalityHeaderStyle(nationality) {
			const color = this.nationalityColors[nationality] || "black";
			return {
				backgroundColor: "white",
				color: color,
				textAlign: "center",
				borderBottom: `4px solid ${color}`,
				fontSize: "4em",
				borderTop: "none",
				marginTop: "0"
			};
		},
		getShipNameStyle(nationality) {  
			const color = this.nationalityColors[nationality] || "white";  
			return {  
				backgroundColor: color,  
				color: "white",  
				textAlign: "right",  
				borderBottom: `2px solid white`, // Keep the bottom border white for the first column  
			};  
		},
		async generateHighlightedImage(flag) {
			this.isGeneratingHighlighted = true;
			try {
				this.highlightLevel = true;
				await this.$nextTick();
				await this.generateImage(flag);
			} finally {
				this.highlightLevel = false;
				this.isGeneratingHighlighted = false;
			}
		},
		async generateImage(flag) {
			if(flag){
				this.isGenerating = true;
			}
			try {
				const container = this.$refs.tablesContainer;
				await this.$nextTick();
				container.style.display = "block";
				await this.$nextTick();

				const tables = Array.from(container.querySelectorAll('.nationality-table'));
				tables.forEach(table => {
				table.style.width = '700px';
				table.querySelector('table').style.width = '700px';
				});
				const images = await Promise.all(tables.map(async (table) => {
					table.style.display = "block";
					const canvas = await html2canvas(table, { backgroundColor: "#fff" });
					table.style.display = "none";  // Hide immediately after capture to minimize reflows
					return canvas;
				}));

				container.style.display = "none"; // Hide the container again

				if (!images.length) return;

				const gridSize = Math.ceil(Math.sqrt(images.length));
				const cellWidth = images[0].width;
				const rowHeights = [];

				// Calculate max height per row in one pass
				for (let i = 0; i < images.length; i += gridSize) {
					const rowImages = images.slice(i, i + gridSize);
					const maxHeight = Math.max(...rowImages.map(img => img.height));
					rowHeights.push(maxHeight);
				}

				const finalCanvas = document.createElement("canvas");
				finalCanvas.width = gridSize * cellWidth;
				finalCanvas.height = rowHeights.reduce((sum, height) => sum + height, 0);
				const ctx = finalCanvas.getContext("2d");

				// Fill the canvas with a white background
				ctx.fillStyle = "#fff";
				ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

				let xOffset = 0, yOffset = 0;
				let rowIndex = 0;

				// Draw each image on the final canvas
				for (let i = 0; i < images.length; i++) {
					ctx.drawImage(images[i], xOffset, yOffset);

					// Move to the next cell in the grid
					xOffset += cellWidth;
					if ((i + 1) % gridSize === 0) {
						xOffset = 0;
						yOffset += rowHeights[rowIndex];
						rowIndex++;
					}
				}

				// Export the final canvas as an image
				const finalImage = finalCanvas.toDataURL("image/png");
				const link = document.createElement("a");
				link.href = finalImage;
				link.download = "ships_collection.png";
				link.click();
			} finally {
			this.isGenerating = false;
		}
		},
		changeHiddenLabel(){
			this.hiddenLabel = {
				0: 1,
				1: 2,
				2: 0,
			}[this.hiddenLabel] || 0;
			this.hideShips(this.hiddenLabel);
			this.packUserSettings()
		},
		hideShips(x){
			switch(x) {
				case 0:
					this.showAll();
					break;
				case 1:
					this.showTechFull();
					break;
				case 2: 
					this.showTechLess();
					break;
				default:
					showAll();
					break;
			}
		},
		addPlusSign(data){
			return data !== null ? '+ ' + data : null
		},
		sortData(){
			let array = this.realData
			array.sort(function(a, b) {
				var keyA = new Date(a.shipId),
					keyB = new Date(b.shipId);
				if (keyA < keyB) return -1;
				if (keyA > keyB) return 1;
				return 0;
			});
			this.realData = array
		},
		filterLevels(x, y){
			this.filters['level'] = {operator: FilterOperator.AND, constraints: [{value: x, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO},{value: y, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO}]}
		},
		setupColl(x){
			this.collHidden = x
		},
		changeColl(){
			this.collHidden = this.collHidden ? false : true
			let retrievedUserSettings = JSON.parse(localStorage.getItem('userSettings'))
			retrievedUserSettings.collHidden = this.collHidden
			localStorage.setItem('userSettings', JSON.stringify(retrievedUserSettings));
		},
		refreshOptions(){
			this.$refs.dghntChrt.options.plugins.legend.labels.color = 
			this.$refs.dghntChrt.options.plugins.title.color =
			this.$refs.brChrt.options.plugins.legend.labels.color =
			this.$refs.brChrt.options.plugins.title.color = 
			this.$refs.brChrt.options.scales.x.ticks.color = 
			this.$refs.brChrt.options.scales.y.ticks.color = 
			this.$refs.rdrChrt.options.plugins.legend.labels.color =
			this.$refs.rdrChrt.options.scales.r.pointLabels.color = 
			this.$refs.rdrChrt.options.plugins.title.color = 
			this.label();
			this.rerenderChart();
		},
		rerenderChart(){
			this.$refs.dghntChrt.refresh();
			this.$refs.brChrt.refresh();
			this.$refs.rdrChrt.refresh();
		},
		label(){
			if(localStorage.getItem('currentTheme') !== null){
				return JSON.parse(localStorage.getItem('currentTheme')).dark ? '#ffffff' : '#495057'
			} else {
				return '#495057'
			}
		},
		getNewShips(){
			for (let j = 0; j < this.recentProducts.length; j++) {
				this.fullRecentProducts[j] = this.realData[this.findIndexById(this.recentProducts[j]['shipId'])]
			}
			this.loadingRecent = false
		},
		afterImport() {
			const tempData = localStorage.getItem('temp');
			if (!tempData) return;

			const imported = JSON.parse(tempData);
			const lvls = this.realData.map(ship => {
				const match = imported.find(item => item.name === ship.name_en);
				return { id: ship.shipId, name: ship.name_en, lvl: match?.lvl || 0 };
			});

			localStorage.setItem('lvls', JSON.stringify(lvls));
			localStorage.removeItem('temp');
			this.products = this.makeData(); // Directly update component data
		},
		onFileSelected(event) {
			const file = event.target.files[0];
			if (!file) return;

			const fileReader = new FileReader();

			// Use an arrow function to bind `this` to the Vue component instance
			fileReader.onload = (event) => {
				const lines = event.target.result.split("\n");
				const result = [];

				for (let i = 1; i < lines.length; i++) {
					const currentline = lines[i].split(",");
					if (currentline.length < 3) continue; // Skip invalid lines

					const obj = {
						id: currentline[0],
						name: currentline[1],
						lvl: currentline[2],
					};
					result.push(obj);
				}

				localStorage.setItem('temp', JSON.stringify(result));
				localStorage.setItem("retrievedObject", "true");
				this.afterImport();  // Process temp data immediately
				this.checkData();    // Update products
				this.fetch1Time();   // Regenerate chartsData
				this.fetchData();    // Refresh charts
				this.$toast.add({severity:'success', summary:'Imported', detail:'Data loaded!', life: 3000})
			};
			fileReader.readAsText(file);
		},
		CSVExport(){
			if(localStorage.getItem('retrievedObject') !== null){
				let row = []
				let rows = []
				let ships = JSON.parse(localStorage.getItem('lvls'))
				rows.push(JSON.parse(JSON.stringify(Object.keys(ships[1]))))
				for (let i = 0; i < ships.length; i++) {
					row = []
					Object.values(ships[i]).forEach(function(element){
						row.push(JSON.stringify(element).replace(/,/g, "."))
					})
					rows.push(row)
				}
				this.exportToCsv('download', rows)
			} else{
				this.$toast.add({severity:'error', summary: 'Error Message', detail:'Nothing to export. Make changes to the table or refresh the page.', life: 3000});
			}
		},
		exportToCsv(filename, rows) {
			var processRow = function (row) {
				var finalVal = '';
				for (var j = 0; j < row.length; j++) {
						var innerValue = row[j] === null ? '' : row[j].toString();
						if (row[j] instanceof Date) {
							innerValue = row[j].toLocaleString()
						}
						var result = innerValue.replace(/"/g, '').replace(/\\/g, '').replace('null', '');
						if (result.search(/("|,|\n)/g) >= 0)
							result = '"' + result + '"';
						if (j > 0)
							finalVal += ',';
							finalVal += result;
					}
					return finalVal + '\n';
			};

			var csvFile = '';
			for (var i = 0; i < rows.length; i++) {
				csvFile += processRow(rows[i]);
			}

			var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
			if (navigator.msSaveBlob) {
				navigator.msSaveBlob(blob, filename);
			} else {
				var link = document.createElement("a");
				if (link.download !== undefined) {
					var url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", filename);
					link.style.visibility = 'hidden';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}
		},
		encodeTable(data) {
			const flatString = data.map(row => row.join('|')).join('\n');
			const compressed = pako.deflate(flatString, { to: 'string' });
			return Buffer.from(compressed, 'utf-8').toString('base64');
		},
		decodeTable(compressed) {
			const flatString = Buffer.from(compressed, 'base64').toString('utf-8');
			const decompressed = pako.inflate(flatString, { to: 'string' });
			return decompressed.split('\n').map(row => row.split('|'));
		},
		unpackUserSettings(){
			let retrievedUserSettings = JSON.parse(localStorage.getItem('userSettings'))
			this.filterDisplayValue = retrievedUserSettings.filterDisplayValue
			this.tableClass = retrievedUserSettings.tableClass
			this.checked = retrievedUserSettings.checked
			this.hideShips(retrievedUserSettings.hiddenLabel)
			this.setupColl(retrievedUserSettings.collHidden)
		},
		packUserSettings(){
			this.userSettings.collHidden = this.collHidden
			this.userSettings.filterDisplayValue = this.filterDisplayValue
			this.userSettings.tableClass = this.tableClass
			this.userSettings.checked = this.checked
			this.userSettings.hiddenLabel = this.hiddenLabel
			localStorage.setItem('userSettings', JSON.stringify(this.userSettings));
		},
		sort(arr){
			var ordered = Object.keys(arr).sort().reduce(
				(obj, key) => { 
					obj[key] = arr[key]; 
					return obj;
				}, 
				{}
			);
			return ordered
		},
		returnData(data, val){
			if(data !== null){
				return data[val]
			}
			return null
		},
		changeReturnValue(){
			this.returnValue = {
				0: 1,
				1: 2,
				2: 0,
			}[this.returnValue] || 0;
			this.returnValueLabel = {
				0: 'My ships',
				1: 'All ships',
				2: 'Compare',
			}[this.returnValue] || 0;
		},
		changeReturnValueMax(){
			this.returnValueMax = {
				0: 1,
				1: 2,
				2: 0,
			}[this.returnValueMax] || 0;
			this.returnValueLabelMax = {
				0: 'My ships',
				1: 'All ships',
				2: 'Compare',
			}[this.returnValueMax] || 0;
		},
		checkData() {
			if (localStorage.getItem('retrievedObject')) {
				this.products = this.makeData(); // Always use latest lvls
			} else {
				this.fetch1Time(); // Initial launch
			}
			this.loading = false;
		},
		makeData(){
			let lvlsData = JSON.parse(localStorage.getItem('lvls'))
			let row = {}
			let lvls = []
			for (let i = 0; i < this.realData.length; i++) {
				row = this.realData[i]
				row['level'] = lvlsData[i]['lvl']
				lvls.push(row)
			}
			return lvls
		},
		doSettings(){
			if(localStorage.getItem('retrievedObject') === null){
				this.packUserSettings()
			}
			if(localStorage.getItem('retrievedObject') !== null){
				this.unpackUserSettings()
			}
		},
		fetch1Time(){
			let count120Tech = {}
			let countType = {}
			let countRarities = {}
			let countAffiliations = {}
			let countTech = {}
			let countCollTech = {}
			let count120CollTech = {}
			let count120 = {}
			let countApplicable = {}

			this.products.forEach(function(element){
				if(element.level >= 120 && element.level <= 125 && element.collectionApplicable !== null){
					count120[element.hullType] = (count120[element.hullType] || 0) + 1;
					count120Tech[element.maxLevelStat] = (count120Tech[element.maxLevelStat] || 0) + 1;
					count120CollTech[element.collectionStat] = (count120CollTech[element.collectionStat] || 0) + 1;
				}
				if(element.collectionApplicable !== null){
					countType[element.hullType] = (countType[element.hullType] || 0) + 1;
					countRarities[element.rarity] = (countRarities[element.rarity] || 0) + 1;
					countTech[element.maxLevelStat] = (countTech[element.maxLevelStat] || 0) + 1;
					countCollTech[element.collectionStat] = (countCollTech[element.collectionStat] || 0) + 1;
					countApplicable[element.collectionApplicable] = (countApplicable[element.collectionApplicable] || 0) + 1;
					countApplicable[element.maxLevelApplicable] = (countApplicable[element.maxLevelApplicable] || 0) + 1;
				}
				countAffiliations[element.nationality] = (countAffiliations[element.nationality] || 0) + 1;
			})

			let barsTech = {}
			for (let j = 0; j < Object.values(countType).length; j++) {
				if(count120[Object.keys(countType)[j]]){
					barsTech[Object.keys(countType)[j]] = count120[Object.keys(countType)[j]]
				}
				else{
					barsTech[Object.keys(countType)[j]] = 0
				}
			}

			let radarMaxLevel = {}
			for (let j = 0; j < Object.values(countTech).length; j++) {
				if(count120Tech[Object.keys(countTech)[j]]){
					radarMaxLevel[Object.keys(countTech)[j]] = (100 * count120Tech[Object.keys(countTech)[j]]) / countTech[Object.keys(countTech)[j]]
				}
				else{
					radarMaxLevel[Object.keys(countTech)[j]] = 0
				}
			}

			let radarCollection = {}
			for (let k = 0; k < Object.values(countCollTech).length; k++) {
				if(count120CollTech[Object.keys(countCollTech)[k]]){
					radarCollection[Object.keys(countCollTech)[k]] = Math.round((100 * count120CollTech[Object.keys(countCollTech)[k]]) / countCollTech[Object.keys(countCollTech)[k]]) 
				}
				else{
					radarCollection[Object.keys(countCollTech)[k]] = 0
				}
			}
			this.types = Object.keys(countType)
			this.rarities = Object.keys(countRarities)
			this.affiliations = Object.keys(countAffiliations)

			var collLevelTest = 0
			var collLevelUser = 0
			var collLevelRow = {}
			var collLevelTable = {}
			var collLevelRows = []
			collLevelTable.collLevelRows = collLevelRows
			
			var maxLevelTest = 0	
			var maxLevelUser = 0
			var maxLevelRow = {}
			var maxLevelTable = {}
			var maxLevelRows = []
			maxLevelTable.maxLevelRows = maxLevelRows

			for (let j = 0; j < Object.keys(countType).length; j++) {
				maxLevelRow["type"] = Object.keys(countType)[j]
				collLevelRow["type"] = Object.keys(countType)[j]
				for (let k = 0; k < Object.keys(countTech).length; k++) {
					collLevelTest = 0
					collLevelUser = 0
					maxLevelTest = 0
					maxLevelUser = 0
					for (let i = 0; i < this.products.length; i++) {
						let applicableCollection = JSON.parse(`[${this.products[i].collectionApplicable}]`);
            			let applicableMaxLevel = JSON.parse(`[${this.products[i].maxLevelApplicable}]`);
						if (this.products[i].collectionStat === Object.keys(countTech)[k] && applicableCollection.includes(Object.keys(countType)[j])){
							collLevelTest += this.products[i].collectionBonus - 0
							if(this.products[i].level >= 120 && this.products[i].level <= 125){
								collLevelUser += this.products[i].collectionBonus - 0
							}
						}
						if (this.products[i].maxLevelStat === Object.keys(countTech)[k] && applicableMaxLevel.includes(Object.keys(countType)[j])){
							maxLevelTest += this.products[i].maxLevelBonus - 0
							if(this.products[i].level >= 120 && this.products[i].level <= 125){
								maxLevelUser += this.products[i].maxLevelBonus - 0
							}
						}
					}
					collLevelRow[Object.keys(countTech)[k]] = collLevelTest === 0 ? null : ['+' + collLevelUser, '+' + collLevelTest, collLevelUser + '/' + collLevelTest]
					maxLevelRow[Object.keys(countTech)[k]] = maxLevelTest === 0 ? null : ['+' + maxLevelUser, '+' + maxLevelTest, maxLevelUser + '/' + maxLevelTest]
				}
				collLevelTable.collLevelRows.push(collLevelRow)
				maxLevelTable.maxLevelRows.push(maxLevelRow)
				collLevelRow = {}
				maxLevelRow = {}
			}
			let chartsData = [
				this.sort(countAffiliations), //chartsData[0]
				countRarities,
				this.sort(countType),
				this.sort(barsTech),
				this.sort(countTech),
				this.sort(radarMaxLevel),
				this.sort(radarCollection),
				collLevelTable.collLevelRows,
				maxLevelTable.maxLevelRows,
				countApplicable
			]
			localStorage.setItem('chartsData', JSON.stringify(chartsData));
			this.fetchData();
		},
		fetchData(){
			if(localStorage.getItem('retrievedObject') !== null){
				this.products = this.makeData()
			}
			let notNullLength = 0;
			let sum = [];
			let sum120 = [];
			this.products.forEach(function(element){
				if (element.collectionApplicable !== null) {
					notNullLength++;
				}
				if (element.level != 0 && element.level < 120 && element.collectionApplicable !== null) {
					sum.push(element.level);
				}
				if (element.level >= 120 && element.level <= 125 && element.collectionApplicable !== null) {
					sum120.push(element.level);
				}
			})

			this.percent = sum120.length
			this.filterLength = notNullLength

			var chartsData = JSON.parse(localStorage.getItem('chartsData'));

			this.products1 = chartsData[7]
			this.chartsDataProducts = chartsData[8]
			
			this.types = Object.keys(chartsData[2]);
			let array = Object.keys(chartsData[1]);
			Array.prototype.move = function(from, to) {
				this.splice(to, 0, this.splice(from, 1)[0]);
				return this;
			};
			array.move(3,0)
			array.move(4,0)
			this.rarities = array;
			this.affiliations = Object.keys(chartsData[0]);

			this.chartData = {
				labels: ['In progress', '120 or higher', 'Not acquired'],
				datasets: [
					{
						data: [sum.length, sum120.length, this.products.length - sum.length - sum120.length],
						type: 'doughnut',
						backgroundColor: ["#FF6384","#36A2EB","#FFCE56"],
						hoverBackgroundColor: ["#FF6384","#36A2EB","#FFCE56"]
					}
				]
			}

			this.basicData = {
				labels: Object.keys(chartsData[2]),
				datasets: [
					{
						data: Object.values(chartsData[2]),
						type: 'bar',
						label: 'All ships by types',
						backgroundColor: '#42A5F5'
					},
					{
						data: Object.values(chartsData[3]),
						type: 'bar',
						label: 'Your ships',
						backgroundColor: '#FFA726'
					}
				]
			},

			this.normalData = {
				labels: Object.keys(chartsData[4]),
				datasets: [
					{
						label: 'Collection in %',
						type: 'radar',
						data: Object.values(chartsData[6]),
						backgroundColor: 'rgba(179,181,198,0.2)',
						borderColor: 'rgba(179,181,198,1)',
						pointBackgroundColor: 'rgba(179,181,198,1)',
						pointBorderColor: '#fff',
						pointHoverBackgroundColor: '#fff',
						pointHoverBorderColor: 'rgba(179,181,198,1)',
					},
					{
						label: 'Max level in %',
						type: 'radar',
						data: Object.values(chartsData[5]),
						backgroundColor: 'rgba(255,99,132,0.2)',
						borderColor: 'rgba(255,99,132,1)',
						pointBackgroundColor: 'rgba(255,99,132,1)',
						pointBorderColor: '#fff',
						pointHoverBackgroundColor: '#fff',
						pointHoverBorderColor: 'rgba(255,99,132,1)',
					},
				],
			}
		},
		changeTableDisplay(){
			this.tableClass = this.tableClass === "p-datatable-sm" ? "p-datatable" : "p-datatable-sm"
			this.packUserSettings()
		},
		changeFilterDisplay(){
			this.filterDisplayValue = this.filterDisplayValue === "row" ? "menu" : "row"
			this.packUserSettings()
		},
		showTech(filter, type){
			this.filters[filter] = {value: type, matchMode: FilterMatchMode.CONTAINS};
			window.scrollTo(0,0);
		},
		showAll(){
			this.filters['collectionBonus'] = {value: null, matchMode: FilterMatchMode.CONTAINS};
		},
		showTechFull(){
			this.filters['collectionBonus'] = {operator: FilterOperator.OR, constraints: [
                {value: '1', matchMode: FilterMatchMode.EQUALS},
                {value: '2', matchMode: FilterMatchMode.EQUALS}]}
		},
		showTechLess(){
			this.filters['collectionBonus'] = {operator: FilterOperator.AND, constraints: [
                {value: '1', matchMode: FilterMatchMode.NOT_EQUALS},
                {value: '2', matchMode: FilterMatchMode.NOT_EQUALS}]}
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
		confirmChangeSelected(){
			this.changeProductsDialog = true;
		},
		changeSelectedProducts(confirmLevel) {
			for (let i = 0; i < this.selectedProducts.length; i++) {
				if(this.selectedProducts[i].shipId){
					this.saveCats(confirmLevel, this.selectedProducts[i].shipId)
				}
			}
			this.changeProductsDialog = false
			this.selectedProducts = null
			this.confirmLevel = null
			this.fetch1Time()
		},
		clearData(){
			this.$confirm.require({
				message: 'Do you want to delete all?',
				header: 'Delete Confirmation',
				icon: 'pi pi-info-circle',
				acceptClass: 'p-button-danger',
				accept: () => {
					localStorage.clear();
					this.$toast.add({severity:'info', summary:'Confirmed', detail:'Local storage emptied', life: 3000});
					location.reload();
				}
			});
		},
		welcomeGuest(){
			if(localStorage.getItem('retrievedObject')){
				this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Welcome back!', life: 3000}); 
			}
			else{
				this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'Welcome!', life: 3000});
			}
		},
		verifyAllProducts(){
			if(localStorage.getItem('retrievedObject')){
				let arr = JSON.parse(localStorage.getItem('lvls'))
				let row = {}
				let result = []
				for (let i = 0; i < this.realData.length; i++) {
					row = {}
					let searchIndex = arr.findIndex((elem) => elem.name == this.realData[i].name_en);
					row['id'] = this.realData[i].shipId
					row['name'] = this.realData[i].name_en
					row['lvl'] = searchIndex > -1 ? arr[searchIndex].lvl : 0
					result.push(row)
				}
				localStorage.setItem('lvls', JSON.stringify(result))
			}
		},
		updateData(){
			this.fetch1Time()
			this.doSettings()
			this.$toast.add({severity:'info', summary:'Confirmed', detail:'List updated', life: 3000});
		},
		saveCats(x, y) {
			if(this.isPositiveInteger(x)){
				let lvlsData = JSON.parse(localStorage.getItem('lvls'));
				if(x - 0 >= 120){
					if(lvlsData[this.findIndexById(y)]["lvl"] < 120){
						this.percent++
					}
				}
				else{
					if(lvlsData[this.findIndexById(y)]["lvl"] >= 120){
						this.percent--
					}
				}
				if(localStorage.getItem('retrievedObject') !== null){
					lvlsData[this.findIndexById(y)]["lvl"] = x - 0;
					this.products[this.findIndexById(y)]["level"] = x - 0;
					localStorage.setItem("lvls", JSON.stringify(lvlsData));
					this.getNewShips();
				}
				else{
					lvlsData[this.findIndexById(y)]["lvl"] = x - 0;
					this.products[this.findIndexById(y)]["level"] = x - 0;
					localStorage.setItem("retrievedObject", JSON.stringify('true'));
					this.getNewShips();
					localStorage.setItem("lvls", JSON.stringify(lvlsData));
					this.fetch1Time();
					this.$toast.add({severity:'success', summary: 'Successful', group: 'br', detail: 'You have successfuly changed your first record!', life: 3000}); 
				}
				this.doSettings()
			} else{
				this.$toast.add({severity:'error', summary: 'Error Message', detail:'Please enter valid number', life: 3000});
			}
		},
		isPositiveInteger(val) {
			let str = String(val);
			str = str.trim(); 
			if (!str) {
				return false;
			}
			str = str.replace(/^0+/, "") || "0";
			var n = Math.floor(Number(str));
			return n !== Infinity && n <= 125 && String(n) === str && n >= 0;
		},
		levels(){
			if(localStorage.getItem('lvls') === null){
				let lvls = []
				let row = {}
				for (let i = 0; i < this.realData.length; i++) {
					row = {}
					row['id'] = this.realData[i].shipId
					row['name'] = this.realData[i].name_en
					row['lvl'] = this.realData[i].level
					lvls.push(row)
				}
				localStorage.setItem('lvls', JSON.stringify(lvls));
			}
		},
		clearFilter() {
			this.dtSortField = 'shipId'
			this.filters = {
				'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'name_en': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'rarity': {value: null, matchMode: FilterMatchMode.IN},
				'hullType': {value: null, matchMode: FilterMatchMode.IN},
				'nationality': {value: null, matchMode: FilterMatchMode.IN},
				'collectionStat': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'collectionApplicable': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'collectionBonus': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'maxLevelApplicable': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'maxLevelBonus': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'maxLevelStat': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'level': {value: null, matchMode: FilterMatchMode.EQUALS}
			}
			this.unpackUserSettings()
		},
		levelClass(data) {
			return [
				{
					'zero': data.level == 0,
					'started': data.level > 0 && data.level < 70,
					'limit': data.level >= 70 && data.level < 100,
					'inProcess': data.level >= 100 && data.level < 120,
					'a120': data.level >= 120
				 }
			];
		},
		findIndexById(code) {
			let index = -1;
			for (let i = 0; i < this.realData.length; i++) {
				if (this.realData[i]['shipId'] == code) {
					index = i;
					break;
				}
			}
			return index;
		},
		isDark() {
			return this.$appState.darkTheme ? 'color: white' : 'color: #495057';
		}
	}
}
</script>

<style lang="scss" scoped>

.product-badge {
	border-radius: 2px;
	padding: .25em .5rem;
	text-transform: uppercase;
	font-weight: 700;
	font-size: 12px;
	letter-spacing: .3px;
}
.done {
	width: 4rem;
	margin-right: 0.5rem;
	text-align: center;
}
img {
	vertical-align: middle;
	cursor: pointer;
	margin-left: 0.4rem;
}
.table-img {
	display: block;
	margin-left: auto;
	margin-right: auto;
}
.product-badge.status-normal {
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
.zero {
	font-weight: 600;
	color: #CCC;
	display:inline-block;
}
.started {
	font-weight: 600;
	color: #e91e63;
	display:inline-block;
}
.limit {
	font-weight: 600;
	color: #ad7e2d;
	display:inline-block;
}
.inProcess {
	font-weight: 600;
	color: #339999;
	display:inline-block;
}
.a120 {
	font-weight: 600;
	color: #00B050;
	display:inline-block;
}
.image-text {
	white-space:nowrap
}
::v-deep(.row-accessories) {
	background-color: rgba(0,0,0,.15) !important;
}

.nationality-table {
  margin: 20px 0;
  background-color: white;
}

.nationality-table h3 {
  padding: 20px 0;
  margin: 0;
  font-size: 2em;
}

.nationality-table table {
  width: auto !important;
  table-layout: auto !important;
  border-collapse: collapse;
  font-size: 2em;
  border-top: none !important;
}

.nationality-table table th,  
.nationality-table table td {  
  border-bottom: 3px solid inherit !important;
  border-right: 0;
  padding: 3px;  
  text-align: left;  
  color: black;  
  width: auto;
  overflow: visible;
}
.nationality-table table th {
  /*width: 33%;*/
  overflow: visible !important;
  text-align: center !important;
}
.nationality-table table td {
  /*width: 33%;*/
  overflow: visible !important;
  white-space: nowrap;
}
.nationality-table table th:first-child,  
.nationality-table table td:first-child {  
  color: white;
  border-bottom: 5px solid white;
  width: 50% !important;
  min-width: 350px;
  white-space: nowrap;
}
.nationality-table table th:first-child { /*?????*/
  text-align: right;
  color: black !important;
}
.nationality-table table th:not(:first-child),
.nationality-table table td:not(:first-child) {
  width: 25% !important;
  min-width: 175px;
}
.tables-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  background: white;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(700px, 1fr));
  gap: 20px;
}
h3 {
  padding: 20px 0;
  font-size: 2em; /* Increase font size */
}
.highlighted-row {
  background-color: #00FF0044 !important;
}
.p-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.tables-container {
  grid-template-columns: repeat(auto-fill, 700px); /* Fixed width */
  justify-content: center; /* Center tables */
}
.stat-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>