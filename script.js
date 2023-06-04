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
	async updateApp(appData) {
		const appDataString = JSON.stringify(appData);

		const response = await fetch(`${this.url}/Face/Update_app`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Length': 124,
			},
			body: `'${appDataString}'`,
		});
		const json = await response.json();
		return json;
	},
	async createNewApp(appData) {
		const appDataString = JSON.stringify(appData);
		const appDataNormalized = appDataString.slice(1, appDataString.length - 1);

		const response = await fetch(`${this.url}/Face/New_app`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Length': 124,
			},
			body: appDataNormalized,
		});
		console.log(appDataNormalized);
		return response;
	},
};

document.addEventListener('DOMContentLoaded', main);

function main() {
	const tableWrapper = document.querySelector('.table-responsive');
	const modal = document.getElementById('Modal');
	const saveChangesButton = document.getElementById('save-changes');

	handleModalShow(modal);
	handleModalHide(modal);
	renderTable(tableWrapper);
	saveChangesButton.addEventListener('click', () => handleUpdateApp(modal));
}

async function renderTable(parentElement) {
	const table = document.createElement('table');
	table.classList = 'table table-hover table-bordered';
	table.innerHTML = `
		<thead>
			<tr class="table-dark">
				<th scope="col">ID</th>
				<th scope="col">Имя приложения</th>
				<th scope="col">Псевдоним</th>
				<th scope="col">Политика</th>
				<th scope="col">Изменить</th>
			</tr>
		</thead>
		<tbody id="table-body"></tbody>`;

	const appData = await API.getAppList();

	fillTable(table.querySelector('#table-body'), appData);
	parentElement.appendChild(table);
}

function fillTable(tableBody, data) {
	data.app_table_ids.forEach((_, index) => {
		const cellData = [
			data.app_table_ids[index],
			data.names[index],
			data.ids[index],
			data.policy_ids[index],
		];
		createRow(tableBody, cellData);
	});
}

function removeTable(table) {
	table.remove();
}

function createRow(tableBody, cellDataArr) {
	const row = tableBody.insertRow();
	cellDataArr.forEach((cellData) => createCell(row, cellData));

	const lastCell = row.insertCell();
	createEditButton(lastCell, cellDataArr);
}

function createCell(row, cellData) {
	const cell = row.insertCell();
	cell.innerText = cellData;
}

function createEditButton(element, relatedData) {
	element.innerHTML = `<button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#Modal" data-app-id='${
		relatedData[0] || ''
	}' data-app-name='${relatedData[1] || ''}' data-app-alias='${
		relatedData[2] || ''
	}' data-app-policy='${relatedData[3] || ''}' >Изменить</button>`;
}

function handleModalShow(modalElement) {
	modalElement.addEventListener('show.bs.modal', function (event) {
		const button = event.relatedTarget;

		const appId = button.getAttribute('data-app-id');
		const appName = button.getAttribute('data-app-name');
		const appAlias = button.getAttribute('data-app-alias');
		const appPolicy = button.getAttribute('data-app-policy');

		const appIdInput = modalElement.querySelector('#app-id');
		const appNameInput = modalElement.querySelector('#app-name');
		const appAliasInput = modalElement.querySelector('#app-alias');
		const appPolicyInput = modalElement.querySelector('#app-policy');

		appIdInput.value = appId;
		appNameInput.value = appName;
		appAliasInput.value = appAlias;
		appPolicyInput.value = appPolicy;
	});
}

function handleModalHide(modalElement) {
	modalElement.addEventListener('hidden.bs.modal', function (event) {
		closeAlert();
	});
}

async function handleUpdateApp(modalElement) {
	// const appIdValue = modalElement.querySelector('#app-id').value;
	const appNameValue = modalElement.querySelector('#app-name').value;
	const appAliasValue = modalElement.querySelector('#app-alias').value;
	const appPolicyValue = modalElement.querySelector('#app-policy').value;

	const appData = {
		app_id: appAliasValue,
		app_name: appNameValue,
		policy_id: appPolicyValue,
		agent_js_config: '123123',
		correlations_config: '321321',
	};

	const res = await API.updateApp(appData);

	if (!errorWhileFetching(res)) {
		const modalForJS = bootstrap.Modal.getInstance(modalElement);
		modalForJS.hide();
		removeTable(document.querySelector('table'));
		renderTable(document.querySelector('.table-responsive'));
	} else {
		showAlert();
	}
}

function errorWhileFetching(fetchResponse) {
	if (!fetchResponse.error) {
		console.warn(`Don't know how to handle this type of response :(`);
		return;
	}

	switch (fetchResponse.error) {
		case '0': {
			return false;
		}
		case '1': {
			return true;
		}
		default: {
			return true;
		}
	}
}

function showAlert() {
	const alertElement = document.querySelector('.alert');
	alertElement.classList.add('d-block');
}

function closeAlert() {
	const alertElement = document.querySelector('.alert');
	alertElement.classList.remove('d-block');
}
