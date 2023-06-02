'use strict';

const API = {
	url: 'http://checkstatus.website:8099',

	async getAppList() {
		const response = await fetch(`${this.url}/Face/App_List`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Length': 2,
			},
			body: JSON.stringify(''),
		});
		const json = await response.json();
		return json;
	},
};

document.addEventListener('DOMContentLoaded', main);

async function main() {
	const table = document.getElementById('table-body');
	const appData = await API.getAppList();

	appData.app_table_ids.forEach((id, index) => {
		const cellData = [
			appData.app_table_ids[index],
			appData.names[index],
			appData.ids[index],
			appData.policy_ids[index],
		];
		createRow(table, cellData);
	});
}

function createRow(table, cellDataArr) {
	let row = table.insertRow();
	cellDataArr.forEach((cellData) => createCell(row, cellData));

	let lastCell = row.insertCell();
	lastCell.innerHTML = '<button class="btn btn-secondary">Изменить</button>';
}

function createCell(row, cellData) {
	let cell = row.insertCell();
	cell.innerText = cellData;
}
