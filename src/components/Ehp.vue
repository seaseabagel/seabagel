<template>
	<div class="grid">
        <div class="col-24 xl:col-8">
			<div class="card">
                <h5>Ship</h5>
                    <DataTable id="dt" ref="dt" stripedRows :value="ehp125" :paginator="true" :rows="10" class="p-datatable-sm" :rowsPerPageOptions="[10,25,50]"
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
					responsiveLayout="scroll" v-model:filters="filters" :loading="loading" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} vanguard ships" >
					<template #header>
						<div class="flex align-items-center">
							<span class="p-input-icon-left flex align-items-center">
								<i class="pi pi-search" />
								<InputText style="max-width: 14rem" v-model="filters['global'].value" placeholder="Keyword Search" />
							</span>
						</div>
					</template>
					<Column field="Ship" header="Ship" :sortable="true" />
					<Column field="Armor" header="Armor" :sortable="true" />
					<Column field="High Level Harmonic eHP" header="Harmonic eHP" :sortable="true">
                    </Column>
					<Column field="SORT" header="SORT" :sortable="true">
                    </Column>
                    <Column :exportable="false" style="min-width:8rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-plus" class="p-button-rounded p-button-warning p-button-text" @click="handleChartData(slotProps.data.Ship)" />
                            </template>
                    </Column>
				</DataTable>
            </div>
        </div>
        <div class="col-12 xl:col-4">
            <div class="card">
                <h5>Enemy</h5>
                <TreeSelect v-model="selectedEnemies" :options="nodes" @change="enemiesClick()" display="chip" selectionMode="checkbox" placeholder="Select Enemies"></TreeSelect>
            </div>
            <!-- <div class="card">
                <h5>Level</h5>
                <ToggleButton v-model="is125" onLabel="125" offLabel="120" class="w-full sm:w-10rem" />
            </div> -->
        </div>
    </div>
    <div class="card">
        <Chart ref="lnChrt" type="line" :data="lineChartData" :options="lineOptions" />
    </div>
</template>

<script>

import ProductService from '../service/ProductService';
import {FilterMatchMode, FilterOperator} from 'primevue/api';
import EventBus from '../AppEventBus';

export default {
    productService: null,
    data() {
        return {
            loading: false,
            is125: true,
            selectedEnemies: [],
            selectedEnemiesLabels: [],
            selectedShips: [],
            lineChartData: null,
            defaultData: [],
            defaultShips: [{name: 'ÄgirAP', level: false}, 
            {name: 'Anchorage', level: false}, 
            {name: 'Brest', level: false}, 
            {name: 'Kronshtadt', level: false}, 
            {name: 'Drake', level: false}, 
            {name: 'Azuma', level: false}, 
            {name: 'Roon (Fate)', level: false}],
            selectedNodes2: null,
            filters: {
				'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'Ship': {value: null, matchMode: FilterMatchMode.CONTAINS},
				'Armor': {value: null, matchMode: FilterMatchMode.IN}
			},
            ehp120: null,
            ehp125: null,
            selectedGroupedCities1: null,
            selectedGroupedCities2: null,
            groupedCities2: [],
            groupedCities1: [],
            nodes: [],
			lineOptions: {
				plugins: {
					legend: {
						labels: {
							color: this.label()
						}
					},
					title: {
						display: false
					}
				},
				scales: {
					x: {
						ticks: {
							color: this.label()
						},
						grid: {
							color: '#495057'
						}
					},
					y: {
						ticks: {
							color: this.label()
						},
						grid: {
							color: '#495057'
						}
					}
				},
                elements: {
                    point: {
                        hoverRadius: 8,
                        radius: 5
                    }
                }
			}
        }
    },	
	created() {
		this.productService = new ProductService();
	},
	themeChangeListener: null,
	beforeUnmount() {
		EventBus.off('theme-change', this.themeChangeListener);
	},
    mounted() {
        this.loading = true;
        this.productService.getEhp().then(data => {this.ehp125 = data 
        this.defaultDatasetHandler()
        this.loading = false});
        this.productService.getNodes().then(data => {this.nodes = data});
		this.themeChangeListener = () => {
			this.refreshOptions();
		};
		EventBus.on('theme-change', this.themeChangeListener);
    },
    methods: {
        enemiesClick(){
            let tempNodes = JSON.parse(JSON.stringify(this.nodes))
            let keys = []
            let labels = []
            Object.keys(this.selectedEnemies).forEach(function(element){
                if(element.length == 5){
                    keys.push(element)
                }
            })
            keys.forEach(function(element){
                labels.push(tempNodes[element.slice(0,1)].children[element.slice(2,3)].children[element.slice(4,5)].label)
            })
            this.selectedEnemiesLabels = JSON.parse(JSON.stringify(labels))
            if(this.selectedShips.length <= 0){
                this.defaultDataHandler(this.defaultShips, this.selectedEnemiesLabels)
            }
            else {
                this.defaultDataHandler(this.selectedShips, this.selectedEnemiesLabels)
            }
        },
        handleChartData(data){
            let res = {name: data, level: this.is125}
            let req  = false
            for (let i = 0; i < this.selectedShips.length; i++){
                if (this.selectedShips[i]['name'] == res['name'] && this.selectedShips[i]['level'] == res['level'])
                {
                    req = true
                    break;
                }
                else 
                    req = false
            }
            if(!req){
                this.selectedShips.push({
                    name: data,
                    level: this.is125
                })
            }
            this.defaultDataHandler(this.selectedShips, this.selectedEnemiesLabels)
        },
        defaultDatasetHandler(){
            this.defaultDataHandler(this.defaultShips, [])
        },
        defaultDataHandler(x, y){ // works somehow
            let colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf']
            let lineChartDefaultDataset = []
            let lineChartShips = []
            let lineChartCutLabels = ['Ship', 'High Level Harmonic eHP', 'Armor', 'SORT', 'Effectiveness']
            let lineChartDefaultLabels = []
            let notTemp = JSON.parse(JSON.stringify(this.ehp125))
            let temp125 = JSON.parse(JSON.stringify(this.ehp125))
            // let temp120 = JSON.parse(JSON.stringify(this.ehp120))
            x.forEach(function(element){
                lineChartShips.push({id: notTemp.findIndex(x => x['Ship'] == element.name), level: element.level})
            })
            let i = 0
            lineChartShips.forEach(function(element){ // for each ship in the list
                let temp = JSON.parse(JSON.stringify(temp125))
                // let temp = JSON.parse(JSON.stringify(temp120))
                i = i > 6 ? 0 : i
                let tempLabel = temp[element.id]['Ship']
                // tempLabel = element.level ? tempLabel + ' (125)' : tempLabel
                tempLabel = tempLabel
                let tempTemp = []
                // tempTemp = element.level ? temp1 : temp
                tempTemp = temp
                lineChartCutLabels.forEach(function(elem){ // delete useless data
                    delete tempTemp[element.id][elem] 
                })
                if(Object.keys(y).length > 0){
                    Object.keys(tempTemp[element.id]).forEach(function(elem){ // если Y не содержит в себе один из элементов этого массива, этот элемент удаляется
                        if(!y.includes(elem)){
                            delete tempTemp[element.id][elem]
                        }
                    })
                }
                lineChartDefaultDataset.push({ // and build dataset
                    label: tempLabel,
                    data: Object.values(tempTemp[element.id]),
                    borderColor: colors[i]
                })
                i++
            })
            lineChartCutLabels.forEach(function(elem){
                delete notTemp[0][elem]
            })
            lineChartDefaultLabels = Object.keys(y).length > 0 ? y : Object.keys(notTemp[0])
            this.lineChartData = {
				labels: lineChartDefaultLabels,
				datasets: lineChartDefaultDataset
			}
        },
        refreshOptions(){
			this.$refs.lnChrt.options.plugins.legend.labels.color =
			this.$refs.lnChrt.options.plugins.title.color = 
			this.$refs.lnChrt.options.scales.x.ticks.color = 
			this.$refs.lnChrt.options.scales.y.ticks.color = 
			this.label();
			this.rerenderChart();
		},
        rerenderChart(){
			this.$refs.lnChrt.refresh();
		},
        label(){
			if(localStorage.getItem('currentTheme') !== null){
				return JSON.parse(localStorage.getItem('currentTheme')).dark ? '#ffffff' : '#495057'
			} else {
				return '#495057'
			}
		},
        round(data){
            return Math.round(((data - 0) * 100 + Number.EPSILON) * 100) / 100
        }
    }
}
</script>

<style lang="scss" scoped>
.p-treeselect {
    width:20rem;
}

@media screen and (max-width: 640px) {
    .p-treeselect {
        width: 100%;
    }
}
</style>