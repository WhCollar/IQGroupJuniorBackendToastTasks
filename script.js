const localeRu = {
    days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    daysShort: ['Вос', 'Пон', 'Вто', 'Сре', 'Чет', 'Пят', 'Суб'],
    daysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    today: 'Сегодня',
    clear: 'Очистить',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    firstDay: 1
}

class Dropdown {

    selectedItemIndex = Number;

    constructor(dropdown) {
        this._dropdown = dropdown
        this._dropdownMenu = $(this._dropdown).find('.dropdown-menu')[0]
        this._dropdownsMenuItems = $(this._dropdownMenu).find('.dropdown-item')
        this._initialization(this._dropdown, this._dropdownMenu)
    }

    _initialization(dropdown, dropdownMenu) {
        let dropdownToggle = $(dropdown).find('.dropdown-toggle')[0]

        $(dropdownToggle).on('click', () => {
            if ($(dropdownMenu).hasClass('d-none')) {
                this.show()
            } else {
                this.hide()
            }
        })

        for (let index = 0; index < this._dropdownsMenuItems.length; index++) {
            const element = this._dropdownsMenuItems[index];
            $(element).on("click", () => {
                this.setSelectedItem(index)
                this.hide()
            })
        }
    }

    setSelectedItem(index) {
        this.selectedItemIndex = index
        let menuItem = this._dropdownsMenuItems[index]
        $(this._dropdown.find('.dropdown-toggle')[0]).text($(menuItem).text())
    }

    getSelectedItemIndex() {
        return this.selectedItemIndex
    }

    hide() {
        $(this._dropdownMenu).addClass('d-none')
    }

    show() {
        $(this._dropdownMenu).removeClass('d-none')
    }
}

class Validator {

    // _inputTypes = ['open-date', 'deposite-term', 'deposite-amount', 'interest-rate', 'replenishment-amount']

    _baseValidators = {
        minNum: this.minimumNumber,
        maxNum: this.maximumNumber,
    }


    constructor(name, baseValue) {
        this.name = name
        this.validator = this._baseValidators[name]
        this.baseValue = baseValue ? baseValue : NaN
        this.isValide = true
    }

    minimumNumber(baseValue, value) {
        if (value < baseValue) {
            return false
        }
        return true
    }

    maximumNumber(baseValue, value) {
        if (value > baseValue) {
            return false
        }
        return true
    }

}

class Offcanvas {

    constructor(offcanvas) {
        this._offcanvas = offcanvas
        this._id = $(this._offcanvas).attr('data-offcanvas-id')
    }

    hide() {
        if (!$(this._offcanvas).hasClass('d-none')) {
            $(this._offcanvas).addClass('d-none')
        }
    }

    show() {
        if ($(this._offcanvas).hasClass('d-none')) {
            $(this._offcanvas).removeClass('d-none')
        }
    }
}

class OffcanvasControllerCheckBox {

    _offcanvases = []

    constructor(offcanvasController) {
        this._offcanvasController = offcanvasController
        this._offcanvaseId = $(this._offcanvasController).attr('data-offcanvas-conroller').split(' ')
        this._initialization(this._offcanvasController)
    }

    _initialization(offcanvasController) {
        $(offcanvasController).on('change', () => {
            if ($(offcanvasController).is(':checked')) {
                this._showAllOffcanvas()
            } else {
                this._hideAllOffcanvas()
            }
        })
    }

    _hideAllOffcanvas() {
        this._offcanvases.forEach((offcanvas) => {
            offcanvas.hide()
        })
    }

    _showAllOffcanvas() {
        this._offcanvases.forEach((offcanvas) => {
            offcanvas.show()
        })
    }

    addOffcanvas(offcanvas) {
        this._offcanvases.push(offcanvas)
    }

    getOffcanvasesId() {
        return this._offcanvaseId
    }

}

class DepositData {

    constructor(startDate, term, sum, percent, sumAdd = 0) {
        this.startDate = startDate
        this.sum = Number(sum)
        this.term = Number(term)
        this.percent = Number(percent)
        this.sumAdd = Number(sumAdd)
    }

    parseFromJson(jsonData) {
        let data = JSON.parse(jsonData)
        this.startDate = data.startDate
        this.sum = Number(data.sum)
        this.term = Number(data.term)
        this.percent = Number(data.percent)
        this.sumAdd = Number(data.sumAdd)
        return this
    }

}

class Input {

    _validators = []

    constructor(input, modelReposytory) {
        this._input = input
        this._initializationModel(this._input, modelReposytory)
        this._initializationInput(this._input)
    }

    _initializationInput(input) {
        if ($(input)[0].hasAttribute('validate')) {
            this._initializationValidators(input)
            $(input).on('input', (e) => {
                this._isValide = true
                this._validators.forEach((validator) => {
                    let baseValue = validator.baseValue
                    let value = $(input).val()
                    validator.isValide = validator.validator(baseValue, value)
                    this._isValide *= validator.isValide
                })
                this._showValidationResualt(input, this._isValide)
            })
        }

        if ($(input)[0].hasAttribute('datepicker')) {
            new AirDatepicker('#' + $(input).attr('id'), {
                locale: localeRu,
                onSelect: () => {
                    this._setValueToModel(input)
                }
            });
        }
    }

    _initializationValidators(input) {
        let dataAtrr = $(input).data()
        let validatorNames = Object.keys(dataAtrr)
        validatorNames.forEach((validatorName) => {
            let baseValue = dataAtrr[validatorName]
            this._addValidator(validatorName, baseValue)
        })
    }

    _addValidator(validatorName, baseValue) {
        this._validators.push(new Validator(validatorName, baseValue))
    }

    _showValidationResualt(input, isValide) {
        if (isValide) {
            $(input).closest('.form-element').addClass('is-valide')
            $(input).closest('.form-element').removeClass('is-invalide')
        } else {
            $(input).closest('.form-element').addClass('is-invalide')
            $(input).closest('.form-element').removeClass('is-valide')
        }
    }

    _initializationModel(input, modelReposytory) {
        if ($(input)[0].hasAttribute('model')) {

            let listOfHref = $(input).attr('model').split('.')
            this._modelName = listOfHref[0]
            this._modelField = listOfHref[1]
            this.model = {}
            if (modelReposytory.gethModelByName([this._modelName]) == undefined) {
                let model = new ModelNoGraph(this._modelName, this._modelField)
                modelReposytory.addModel(model)
                this.model = modelReposytory.gethModelByName(this._modelName)
            } else {
                this.model = modelReposytory.gethModelByName(this._modelName)
                this.model.addField(this._modelField)
            }

            $(input).keyup((e) => {
                this._setValueToModel(input)
            })
            $(input).on('change', (e) => {
                this._setValueToModel(input)
            })
        }
    }

    _setValueToModel(input) {
        this.model.getModel()[this._modelField] = $(input).val()
    }
}

class ModelNoGraph {

    name = ''
    _model = {}

    constructor(modelName, fieldName) {
        this.name = modelName
        this.addField(fieldName)
    }

    addField(fieldName) {
        this._model[fieldName] = ''
    }

    getModel() {
        return this._model
    }

}

class ModelReposytory {

    _models = {}

    constructor() {
        if (typeof ModelReposytory.instance === 'object') {
            return ModelReposytory.instance
        }
        ModelReposytory.instance = this
        return ModelReposytory.instance
    }

    gethModelByName(modelName) {
        return this._models[modelName]
    }

    addModel(model) {
        this._models[model.name] = model
    }

}

class API {

    constructor() {
        if (typeof API.instance === 'object') {
            return API.instance
        }
        API.instance = this
        return API.instance
    }

    calculateTotalDepositAmount(data) {
        return  $.ajax({
            url: 'calc.php',
            type: 'POST',
            data: JSON.stringify(data),
            success: (response) => {
                let resault = $.parseJSON(response).sum
                _set_resault_amount(resault)
            },
            error: (error) => {
                console.log(error)
            }
        });
    }

}


function _initialized_all_dropdowns() {
    $('.dropdown').each(function () {
        new Dropdown($(this))
    });
}

function _initialized_all_inputs(modelReposythory) {
    $('input').each(function () {
        new Input($(this), modelReposythory)
    });
}

function _initialized_all_offcanvas_controller_checkbox() {
    $('input[data-offcanvas-conroller][type="checkbox"]').each((index, element) => {
        let offcanvasController = new OffcanvasControllerCheckBox($(element))
        _initialized_all_offcanvas(offcanvasController)
    })


    function _initialized_all_offcanvas(offcanvasController) {
        $('[data-offcanvas-id]').each((index, element) => {
            let offcanvasesId = offcanvasController.getOffcanvasesId()
            let offcanvasId = $(element).attr('data-offcanvas-id')
            if (offcanvasesId.includes(offcanvasId)) {
                let offcanvas = new Offcanvas(element)
                offcanvasController.addOffcanvas(offcanvas)
            }
        })
    }

}

function _initialization_request_button(api, modelReposytory) {
    $('div[data-send-request]').each((index, element) => {
        $(element).on('click', () => {
            let formModel = JSON.stringify(modelReposytory.gethModelByName('depositData').getModel())
            let data = new DepositData().parseFromJson(formModel)
            api.calculateTotalDepositAmount(data)
        })
    })
}

function _set_resault_amount(value) {
    let obj = $('#resault')
    obj.text(' ' + String(value))
    obj.closest('.result-row').removeClass('d-none')
}

$(document).ready(function () {
    let api = new API()
    let modelReposytory = new ModelReposytory()

    _initialized_all_dropdowns();
    _initialized_all_inputs(modelReposytory);
    _initialized_all_offcanvas_controller_checkbox();
    _initialization_request_button(api, modelReposytory);
});