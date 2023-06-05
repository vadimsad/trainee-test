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

	setModalEventListeners(modal);
	renderTable(tableWrapper);
}

async function renderTable(parentElement) {
	const table = createTable();
	const appData = await API.getAppList();

	fillTable(table, appData);
	parentElement.append(table);
}

function createTable() {
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

	return table;
}

function fillTable(table, data) {
	const tableBody = table.querySelector('#table-body');

	data.app_table_ids.forEach((_, index) => {
		const rowData = [
			data.app_table_ids[index],
			data.names[index],
			data.ids[index],
			data.policy_ids[index],
		];
		createRow(tableBody, rowData);
	});
}

function createRow(tableBody, rowData) {
	const row = tableBody.insertRow();
	rowData.forEach((cellData) => createCell(row, cellData));

	createEditButtonCell(row, rowData);
}

function createCell(row, data) {
	const cell = row.insertCell();
	cell.innerText = data;
}

function createEditButtonCell(row, rowData) {
	const cell = row.insertCell();
	const editButton = createEditButton(rowData);
	cell.appendChild(editButton);
}

function createEditButton(relatedData) {
	const button = document.createElement('button');
	button.textContent = 'Изменить';
	button.className = 'btn btn-primary';
	button.type = 'button';
	button.setAttribute('data-bs-toggle', 'modal');
	button.setAttribute('data-bs-target', '#Modal');
	button.setAttribute('data-app-name', `${relatedData[1] || ''}`);
	button.setAttribute('data-app-id', `${relatedData[2] || ''}`);
	button.setAttribute('data-app-policy', `${relatedData[3] || ''}`);

	return button;
}

function setModalEventListeners(modalElement) {
	modalElement.addEventListener('show.bs.modal', handleModalShow);
	modalElement.addEventListener('hide.bs.modal', handleModalHide);

	function handleModalShow(event) {
		const button = event.relatedTarget;
		const isCreateButton = !!button.getAttribute('data-create-app');
		const saveButton = modalElement.querySelector('#save-changes');
		const appIdInput = modalElement.querySelector('#app-id');
		const appNameInput = modalElement.querySelector('#app-name');
		const appPolicyInput = modalElement.querySelector('#app-policy');

		appIdInput.value = button.getAttribute('data-app-id') || '';
		appNameInput.value = button.getAttribute('data-app-name') || '';
		appPolicyInput.value = button.getAttribute('data-app-policy') || '';

		if (isCreateButton) {
			saveButton.addEventListener('click', handleCreateApp);
		} else {
			saveButton.addEventListener('click', handleUpdateApp);
			appIdInput.setAttribute('readonly', '');
			appIdInput.setAttribute('disabled', '');
		}
	}

	function handleModalHide() {
		const saveButton = modalElement.querySelector('#save-changes');
		const appIdInput = modalElement.querySelector('#app-id');
		appIdInput.removeAttribute('readonly');
		appIdInput.removeAttribute('disabled');
		saveButton.removeEventListener('click', handleUpdateApp);
		saveButton.removeEventListener('click', handleCreateApp);
		closeAlert();
	}

	async function handleUpdateApp() {
		try {
			const appData = getFormData(modalElement);
			const res = await API.updateApp(appData);

			if (!errorWhileFetching(res)) {
				const modalForJS = bootstrap.Modal.getInstance(modalElement);
				modalForJS.hide();
				updateTable();
			} else {
				showAlert();
			}
		} catch (error) {
			console.warn(`Error while updating the app: ${error}`);
		}
	}

	async function handleCreateApp() {
		try {
			const appData = getFormData(modalElement);
			const res = await API.createApp(appData);

			if (!errorWhileFetching(res)) {
				const modalForJS = bootstrap.Modal.getInstance(modalElement);
				modalForJS.hide();
				updateTable();
			} else {
				showAlert();
			}
		} catch (error) {
			console.warn(`Error while creating the app: ${error}`);
		}
	}

	function getFormData(modalElement) {
		const appIdValue = modalElement.querySelector('#app-id').value;
		const appNameValue = modalElement.querySelector('#app-name').value;
		const appPolicyValue = modalElement.querySelector('#app-policy').value;

		return {
			app_id: appIdValue,
			app_name: appNameValue,
			policy_id: appPolicyValue,
			agent_js_config: '123123',
			correlations_config: '321321',
		};
	}
}

function updateTable() {
	const tableWrapper = document.querySelector('.table-wrapper');
	const table = document.querySelector('table');
	table.remove();
	renderTable(tableWrapper);
}

function errorWhileFetching(fetchResponse) {
	if (!fetchResponse.error) {
		console.warn(`Don't know how to handle this type of response :(`);
		return;
	}

	switch (fetchResponse.error) {
		case '0':
			return false;
		case '1':
		default:
			return true;
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
