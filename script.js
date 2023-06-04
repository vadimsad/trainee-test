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
	async createApp(appData) {
		const appDataString = JSON.stringify(appData);

		const response = await fetch(`${this.url}/Face/New_app`, {
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
};

document.addEventListener('DOMContentLoaded', main);

function main() {
	const tableWrapper = document.querySelector('.table-wrapper');
	const modal = document.getElementById('Modal');
	const saveChangesButton = document.getElementById('save-changes');
	const createAppButton = document.querySelector('#create-app');

	createAppButton.addEventListener('click', () => {});
	setModalEventListeners(modal);
	renderTable(tableWrapper);
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
	element.innerHTML = `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#Modal" data-app-name='${
		relatedData[1] || ''
	}' data-app-id='${relatedData[2] || ''}' data-app-policy='${
		relatedData[3] || ''
	}' >Изменить</button>`;
}

function setModalEventListeners(modalElement) {
	modalElement.addEventListener('show.bs.modal', handleModalShow);
	modalElement.addEventListener('hide.bs.modal', handleModalHide);

	function handleModalShow(event) {
		const button = event.relatedTarget;
		const isCreateButton = !!button.getAttribute('data-create-app');
		const saveButton = modalElement.querySelector('#save-changes');

		const appId = button.getAttribute('data-app-id');
		const appName = button.getAttribute('data-app-name');
		const appPolicy = button.getAttribute('data-app-policy');

		const appIdInput = modalElement.querySelector('#app-id');
		const appNameInput = modalElement.querySelector('#app-name');
		const appPolicyInput = modalElement.querySelector('#app-policy');

		appIdInput.value = appId;
		appNameInput.value = appName;
		appPolicyInput.value = appPolicy;

		if (isCreateButton) {
			saveButton.addEventListener('click', handleCreateApp);
		} else {
			saveButton.addEventListener('click', handleUpdateApp);

			appIdInput.setAttribute('readonly', '');
			appIdInput.setAttribute('disabled', '');
		}
	}

	function handleModalHide(event) {
		const saveButton = modalElement.querySelector('#save-changes');
		const appIdInput = modalElement.querySelector('#app-id');
		appIdInput.removeAttribute('readonly');
		appIdInput.removeAttribute('disabled');

		saveButton.removeEventListener('click', handleUpdateApp);
		saveButton.removeEventListener('click', handleCreateApp);

		closeAlert();
	}

	async function handleUpdateApp() {
		const appIdValue = modalElement.querySelector('#app-id').value;
		const appNameValue = modalElement.querySelector('#app-name').value;
		const appPolicyValue = modalElement.querySelector('#app-policy').value;

		const appData = {
			app_id: appIdValue,
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
			renderTable(document.querySelector('.table-wrapper'));
		} else {
			showAlert();
		}
	}

	async function handleCreateApp() {
		const appIdValue = modalElement.querySelector('#app-id').value;
		const appNameValue = modalElement.querySelector('#app-name').value;
		const appPolicyValue = modalElement.querySelector('#app-policy').value;

		const appData = {
			app_id: appIdValue,
			app_name: appNameValue,
			policy_id: appPolicyValue,
			agent_js_config: '123123',
			correlations_config: '321321',
		};

		const res = await API.createApp(appData);

		if (!errorWhileFetching(res)) {
			const modalForJS = bootstrap.Modal.getInstance(modalElement);
			modalForJS.hide();
			removeTable(document.querySelector('table'));
			renderTable(document.querySelector('.table-wrapper'));
		} else {
			showAlert();
		}
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
