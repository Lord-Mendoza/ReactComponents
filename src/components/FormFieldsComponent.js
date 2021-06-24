import {Button, Form, Icon, Image as SemanticImage, Input, Popup} from "semantic-ui-react";
import question from "../images/question.png";
import Select from "react-select";
import {Col, Container, Row} from "react-bootstrap";
import React, {useState} from "react";
import PopupComponent from "./PopupComponent";
import SearchFormComponent from "./SearchFormComponent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Moment from 'moment';
import {isNotAnEmptyObject} from "../utilities/ObjectVariableValidators";
import {isNotAnEmptyArray} from "../utilities/ArrayVariableValidators";
import {isANumber} from "../utilities/NumberVariableValidator";

//Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css';
import "react-datepicker/dist/react-datepicker.css";
import "../styling/SearchFormComponent.css";
import "../styling/FormsFieldComponent.css";


function FormFieldsComponent(props) {
    let {
        formFields,
        formFieldsData,
        handlerFunction,
        requiredFields,
        columnCount,
        fieldContainerWidth,
        showWildCardMessage,
        formClassName,
        disableAllFields,
        onFormSubmit
    } = props;
    requiredFields = requiredFields ? requiredFields : [];
    columnCount = columnCount ? columnCount : 2;
    fieldContainerWidth = fieldContainerWidth ? fieldContainerWidth : "";
    showWildCardMessage = showWildCardMessage === true;
    formClassName = formClassName ? formClassName : "";
    disableAllFields = disableAllFields === true;
    onFormSubmit = typeof onFormSubmit === "function" ? onFormSubmit : undefined;

    let initialState = {
        showFieldDetailsPopup: false,
        fieldDetailsData: "",

        showLookupValuePopup: false,
        formLookupObject: {}
    }
    const [formFieldState, setState] = useState(initialState);

    let formObject = formFields;
    let fields = Object.keys(formObject);
    let numberOfColumns = fields.length;
    let numberOfRows = Math.ceil(numberOfColumns / columnCount);

    let fieldCount = 0;  //counter for iterating the form fields
    let rows = [];
    for (let i = 0; i < numberOfRows; i++) {
        let columns = [];
        for (let k = 0; k < columnCount; k++) {
            if (fieldCount < numberOfColumns) {
                let form;

                let currentField = fields[fieldCount];
                let currentFieldObject = formObject[currentField];
                let currentFieldTooltipMsg = currentFieldObject.hasOwnProperty("tooltipMsg") ? currentFieldObject["tooltipMsg"] : null;
                let currentFieldType = currentFieldObject["type"];
                let currentFieldLabel = currentFieldObject["label"] + ":";

                let isRequired = false;
                if (requiredFields.includes(currentField))
                    isRequired = true;

                let requiredAsterisk;
                if (isRequired)
                    requiredAsterisk = <b><span style={{color: '#db2828'}}>*</span></b>;

                if (typeof currentFieldType === "object") {
                    if (Object.keys(currentFieldType).includes("dropdown")) {
                        let tooltip;
                        if (currentFieldTooltipMsg) {
                            tooltip = <Popup
                                content={currentFieldTooltipMsg}
                                trigger={<SemanticImage src={question} style={{
                                    marginLeft: "4px",
                                    marginBottom: "3px",
                                    display: "inline"
                                }}/>}
                                size={'tiny'}
                                position={'top center'}
                                inverted
                                hoverable
                            />;
                        }

                        let allowMultiSelect = currentFieldObject["multiselect"] === true;
                        let isClearable = currentFieldObject["isClearable"] !== false

                        let menuConfig;
                        if (currentFieldObject["menuWidth"] && currentFieldObject["menuWidth"] !== "")
                            menuConfig = (provided) => ({
                                ...provided,
                                width: currentFieldObject["menuWidth"],
                                zIndex: '1000'
                            });
                        else
                            menuConfig = (provided) => ({...provided, zIndex: '1000'});

                        let labelStyle = {}, controlStyle = {};
                        if (disableAllFields) {
                            labelStyle = {color: 'rgba(0,0,0,.87)', fontWeight: '700', opacity: 0.20};
                            controlStyle = {opacity: .45, backgroundColor: "unset"};
                        }

                        let selectComponent;
                        if (typeof currentFieldType["dropdown"] === "function") {
                            selectComponent = currentFieldType["dropdown"]({
                                currentField,
                                formFieldsData,
                                handlerFunction,
                                allowMultiSelect,
                                isClearable,
                                menuConfig,
                                columnCount,
                                multiValueContainer,
                                disableAllFields
                            })
                        } else {
                            let value;
                            if (isNotAnEmptyArray(currentFieldType["dropdown"])) {
                                if (Array.isArray(formFieldsData[currentField])) {
                                    let optionValues = formFieldsData[currentField].map(v => {
                                        return v["value"]
                                    });
                                    value = currentFieldType["dropdown"].filter(option => (optionValues.includes(option["value"])));
                                } else {
                                    value = currentFieldType["dropdown"].filter(option => (option["value"] === formFieldsData[currentField]));
                                }
                            }

                            let dropdownHandlerFunction = (e, {name, value}) => {
                                let label;

                                if (Array.isArray(e)) {
                                    if (isNotAnEmptyArray(e)) {
                                        label = [];
                                        value = [];

                                        e.forEach(selectedOption => {
                                            label.push(selectedOption["label"]);
                                            value.push(selectedOption["value"]);
                                        });
                                    } else
                                        value = e;

                                } else {
                                    label = e && e["label"] ? e["label"] : null;
                                    value = e && e["value"] ? e["value"] : null;
                                }

                                handlerFunction(e, {name, value, label});
                            }

                            selectComponent = <Select
                                name={currentField}
                                value={value || null}
                                options={currentFieldType["dropdown"]}
                                isClearable={isClearable}
                                onChange={dropdownHandlerFunction}
                                isMulti={allowMultiSelect}
                                closeMenuOnSelect={!allowMultiSelect}
                                hideSelectedOptions={false}
                                isDisabled={disableAllFields}
                                components={{
                                    MultiValueContainer: multiValueContainer
                                }}
                                styles={{
                                    container: (provided) => ({
                                        ...provided,
                                        width: columnCount === 3 ? '166px' : columnCount === 4 ? '152px' : '180px',
                                        maxWidth: columnCount === 3 ? '166px' : columnCount === 4 ? '152px' : '180px',
                                        padding: '3px',
                                        flex: 1,
                                        float: 'right',
                                    }),
                                    control: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        borderColor: 'rgba(34, 36, 38, 0.15)',
                                        ...controlStyle
                                    }),
                                    indicatorsContainer: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '30px'
                                    }),
                                    menu: menuConfig,
                                    placeholder: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '30px',
                                        marginLeft: 0,
                                        color: 'hsl(0,0%,75%)'
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '30px',
                                        marginLeft: 0
                                    }),
                                    valueContainer: (provided, state) => ({
                                        ...provided,
                                        justifyContent: "flex-start",
                                        minHeight: '25px',
                                        height: '25px',
                                        maxHeight: '25px',
                                        textOverflow: "ellipsis",
                                        maxWidth: "90%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        flexWrap: "initial"
                                    })
                                }}
                            />;
                        }

                        form = <Form.Field style={{width: '280px'}}>
                            <label key={currentField}
                                   style={{paddingTop: '5px', ...labelStyle}}>{currentFieldLabel} {requiredAsterisk}</label>
                            {selectComponent}
                        </Form.Field>;
                    } else if (Object.keys(currentFieldType).includes("lookupValue")) {

                        let formLookupObject = {
                            name: currentField,
                            lookupTitle: currentFieldLabel.replace(":", ""),
                            ...currentFieldType["lookupValue"]
                        }

                        form = <Form.Field style={{width: '280px'}}>
                            <label>{currentFieldLabel} {requiredAsterisk}</label>
                            <Input name={currentField}
                                   placeholder={currentFieldLabel.replace(":", "")}
                                   type={"text"}
                                   onChange={handlerFunction}
                                   value={formFieldsData[currentField] || ''}
                                   required={isRequired}
                                   disabled={disableAllFields}
                                   action={
                                       <Button icon
                                               style={{backgroundColor: '#B6C1CC'}}
                                               onClick={() => setState(prevState => ({
                                                   ...prevState,
                                                   showLookupValuePopup: true,
                                                   formLookupObject
                                               }))}>
                                           <Icon name='search'/>
                                       </Button>
                                   }
                            />
                        </Form.Field>
                    }
                } else if (typeof currentFieldType === "string") {
                    if (currentFieldType === "number") {
                        form = <Form.Input
                            name={currentField}
                            label={currentFieldLabel}
                            placeholder={currentFieldLabel.replace(":", "")}
                            type={currentFieldType}
                            onKeyPress={allowNumbersOnly}
                            min={0}
                            onChange={handlerFunction}
                            value={formFieldsData[currentField] || ''}
                            required={isRequired}
                            disabled={disableAllFields}
                        />;
                    } else if (currentFieldType === "double") {
                        form = <Form.Input
                            name={currentField}
                            label={currentFieldLabel}
                            placeholder={currentFieldLabel.replace(":", "")}
                            type={currentFieldType}
                            onChange={(e, {name, value}) => allowDoubleOnly(e, {name, value}, handlerFunction)}
                            value={formFieldsData[currentField] || ''}
                            required={isRequired}
                            onBlur={() => addDecimalIfApplicable(currentField, formFieldsData[currentField] || '', handlerFunction)}
                            disabled={disableAllFields}
                        />;
                    } else if (currentFieldType === "date") {
                        let labelStyle = {};
                        if (disableAllFields) {
                            labelStyle = {color: 'rgba(0,0,0,.87)', fontWeight: '700', opacity: 0.20};
                        }

                        form = [
                            <Form.Field style={{width: '280px'}}>
                                <label style={{...labelStyle}}>{currentFieldLabel} {requiredAsterisk}</label>
                                <DatePicker
                                    selected={formFieldsData[currentField] ?
                                        new Date(Moment(formFieldsData[currentField]).format("MM/DD/YYYY")) :
                                        undefined}
                                    onChange={date => handlerFunction({}, {"name": currentField, "value": date})}
                                    dateFormat={"MM/dd/yyyy"}
                                    placeholderText="mm/dd/yyyy"
                                    isClearable
                                    showMonthDropdown
                                    showYearDropdown
                                    scrollableYearDropdown
                                    todayButton={"Today"}
                                    disabled={disableAllFields}
                                />
                            </Form.Field>
                        ];
                    } else if (currentFieldType === "boolean") {
                        let tooltip;
                        if (currentFieldTooltipMsg) {
                            tooltip = <Popup
                                content={currentFieldTooltipMsg}
                                trigger={<SemanticImage src={question} style={{
                                    marginLeft: "4px",
                                    marginBottom: "3px",
                                    display: "inline"
                                }}/>}
                                size={'tiny'}
                                position={'top center'}
                                inverted
                                hoverable
                            />;
                        }

                        let dropdownOptions = [
                            {label: "Yes", value: true},
                            {label: "No", value: false}
                        ];

                        let value;
                        if (!formFieldsData.hasOwnProperty(currentField))
                            value = dropdownOptions.filter(option => (option["value"] === false));
                        else
                            value = dropdownOptions.filter(option => (option["value"] === formFieldsData[currentField]));

                        let dropdownHandlerFunction = (e, {name, value}) => {
                            if (Array.isArray(e))
                                value = e;
                            else
                                value = e && e["value"] ? e["value"] : false;

                            handlerFunction(e, {name, value});
                        }

                        form = <Form.Field style={{width: '280px'}}>
                            <label key={currentField}
                                   style={{paddingTop: '5px'}}>{currentFieldLabel} {requiredAsterisk}
                            </label>

                            <Select
                                name={currentField}
                                value={value}
                                options={dropdownOptions}
                                onChange={dropdownHandlerFunction}
                                hideSelectedOptions={false}
                                isDisabled={disableAllFields}
                                styles={{
                                    container: (provided) => ({
                                        ...provided,
                                        width: columnCount === 3 ? '166px' : columnCount === 4 ? '152px' : '180px',
                                        maxWidth: columnCount === 3 ? '166px' : columnCount === 4 ? '152px' : '180px',
                                        padding: '3px',
                                        flex: 1,
                                        float: 'right',
                                    }),
                                    control: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        borderColor: 'rgba(34, 36, 38, 0.15)'
                                    }),
                                    indicatorsContainer: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '30px'
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '30px',
                                        marginLeft: 0,
                                        color: 'hsl(0,0%,75%)'
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        height: '30px',
                                        minHeight: '30px',
                                        lineHeight: '30px',
                                        marginLeft: 0
                                    }),
                                    valueContainer: (provided) => ({
                                        ...provided,
                                        justifyContent: "flex-start",
                                        minHeight: '25px',
                                        height: '25px',
                                        maxHeight: '25px',
                                        textOverflow: "ellipsis",
                                        maxWidth: "90%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        flexWrap: "initial"
                                    })
                                }}
                            />
                        </Form.Field>;
                    } else if (currentFieldType === "data") {
                        let value = formFieldsData[currentField];
                        if (typeof formFieldsData[currentField] === "boolean")
                            value = formFieldsData[currentField] === true ? "Yes" : "No";

                        let width = columnCount === 2 ? '78px' : columnCount === 3 ? '88px' : '123px'
                        form = [<label key={currentField} style={{width}}>{currentFieldLabel}</label>,
                            <span style={{marginTop: "3px"}}>{value}</span>
                        ];
                    } else if (currentFieldType === "multilineData") {
                        if (formFieldsData[currentField] && formFieldsData[currentField].trim().length > 0) {
                            form = <Form.Field style={{width: '280px'}}>
                                <label key={currentField}>{currentFieldLabel}</label>
                                <SemanticButton size='mini' compact disabled={disableAllFields} onClick={() => setState({
                                    showFieldDetailsPopup: true,
                                    fieldDetailsData: formFieldsData[currentField]
                                })} fluid floated='right'> View Details </SemanticButton>
                            </Form.Field>
                        } else {
                            form = <span style={{fontSize: '13px'}} className={"dataField"}>
                                    <label key={currentField}><b>{currentFieldLabel}</b></label>
                                </span>;
                        }
                    } else if (currentFieldType === "currencyData") {
                        let usdFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
                        let dataValue = formFieldsData[currentField];

                        if (isANumber(dataValue)) {
                            dataValue = usdFormat.format(dataValue);
                        }

                        let width = columnCount === 2 ? '78px' : columnCount === 3 ? '88px' : '123px'
                        form = [<label key={currentField} style={{width}}>{currentFieldLabel}</label>,
                            <span style={{marginTop: "3px"}}>{dataValue}</span>
                        ];
                    } else if (currentFieldType === "textarea") {
                        form = <Form.TextArea
                            name={currentField}
                            label={currentFieldLabel}
                            placeholder={currentFieldLabel.replace(":", "")}
                            onChange={handlerFunction}
                            value={formFieldsData[currentField] || ''}
                            required={isRequired}
                            className={"formFieldsTextArea"}
                            disabled={disableAllFields}
                        />
                    } else {
                        if (currentFieldTooltipMsg) {
                            form = <Form.Field>
                                <label>
                                    {currentFieldLabel}

                                    {requiredAsterisk}

                                    <Popup
                                        content={currentFieldTooltipMsg}
                                        trigger={<SemanticImage src={question} style={{
                                            marginLeft: "4px",
                                            marginBottom: "3px",
                                            display: "inline"
                                        }}/>}
                                        size={'tiny'}
                                        position={'top center'}
                                        inverted
                                        hoverable
                                    />
                                </label>
                                <Input name={currentField}
                                       placeholder={currentFieldLabel.replace(":", "")}
                                       type={currentFieldType}
                                       onChange={handlerFunction}
                                       value={formFieldsData[currentField] || ''}
                                       required={isRequired}
                                       disabled={disableAllFields}
                                />
                            </Form.Field>;
                        } else {
                            form = <Form.Input
                                name={currentField}
                                label={currentFieldLabel}
                                placeholder={currentFieldLabel.replace(":", "")}
                                type={currentFieldType}
                                onChange={handlerFunction}
                                value={formFieldsData[currentField] || ''}
                                required={isRequired}
                                disabled={disableAllFields}
                            />;
                        }
                    }
                }

                let columnWidth = 12 / columnCount;

                columns.push(<Col key={fieldCount} xs={columnWidth} className={'formFieldsCol'}>
                    <Form key={currentField} size='mini' style={{fontSize: '13px'}} onSubmit={onFormSubmit}>
                        <Form.Group inline widths='equal' className={'formFields'}>
                            {form}
                        </Form.Group>
                    </Form>
                </Col>);

                fieldCount++;
            }
        }
        rows.push(<Row key={fieldCount}>{columns}</Row>);
    }

    let wildCardStyling = {};
    if (disableAllFields) {
        wildCardStyling = {color: 'rgba(0,0,0,.87)', opacity: 0.20};
    }

    let wildCardMessage;
    if (showWildCardMessage === true && isNotAnEmptyObject(formFields))
        wildCardMessage = <p style={{fontStyle: "italic", fontSize: "small", marginBottom: "10px", marginTop: "10px", ...wildCardStyling}}>
            Use '*' for Wild Card & Left Justification searches (e.g. '123*', '*123*').
        </p>;

    let fieldDetailsPopup;
    if (formFieldState.showFieldDetailsPopup)
        fieldDetailsPopup = <PopupComponent header={"Details"}
                                            content={<p>
                                                {formFieldState.fieldDetailsData}
                                            </p>
                                            }
                                            footerConfig={"close"}
                                            closeToggled={(value) => value && setState(prevState => ({
                                                ...prevState,
                                                showFieldDetailsPopup: false,
                                                fieldDetailsData: ""
                                            }))}/>;

    let lookupValuePopup;
    if (formFieldState.showLookupValuePopup) {
        let {
            name,
            lookupTitle,

            searchFormFields,
            searchGridColumns,
            additionalFieldsToPopulate,
            searchFormFieldsContainerWidth,

            reducerID,
            searchID,
            searchHandler,

            popupClassName,
        } = formFieldState.formLookupObject;

        const handleLookupSelection = (rowSelected) => {
            formFieldsData[name] = rowSelected[name];

            if (isNotAnEmptyArray(additionalFieldsToPopulate))
                additionalFieldsToPopulate.forEach(fieldName => {
                    formFieldsData[fieldName] = rowSelected[fieldName];
                })

            setState(prevState => ({
                ...prevState,

                showLookupValuePopup: false,
                formLookupObject: {}
            }))
        }

        searchGridColumns = isNotAnEmptyArray(searchGridColumns) ? searchGridColumns.slice() : [];
        searchGridColumns.unshift(
            {name: "select", title: " "},
        );

        let searchFormDefaultValues;
        if (isNotAnEmptyObject(formFieldsData)) {
            searchFormDefaultValues = {};
            Object.keys(formFieldsData).forEach(prop => {
                searchFormDefaultValues[prop] = "*" + formFieldsData[prop] + "*";
            });
        }

        lookupValuePopup = <PopupComponent header={lookupTitle + " Lookup"}
                                           content={<SearchFormComponent config={{
                                               searchFormFields,
                                               searchGridColumns,
                                               searchFormDefaultValues,
                                               searchFormFieldsContainerWidth,

                                               reducerID,
                                               searchID,
                                               searchHandler,

                                               isLookup: true,
                                               lookupSelection: handleLookupSelection
                                           }}/>}
                                           closeToggled={() => setState(prevState => ({
                                               ...prevState,
                                               showLookupValuePopup: false,
                                               formLookupObject: {}
                                           }))}
                                           className={"lookupPopup " + popupClassName}
        />
    }

    return <Container style={{padding: '5px 15px 0 5px', margin: 0, maxWidth: fieldContainerWidth}} className={formClassName}>
        {rows}
        {wildCardMessage}
        {fieldDetailsPopup}
        {lookupValuePopup}
    </Container>;
}

const allowNumbersOnly = (e) => {
    let code = (e.which) ? e.which : e.keyCode;
    if (code > 31 && (code < 48 || code > 57)) {
        e.preventDefault();
    }
}

const allowDoubleOnly = (e, {name, value}, handlerFunction) => {
    if (!value || value.match(/^\d*\.?\d{0,2}$/)) {
        handlerFunction(e, {name, value});
    } else {
        e.preventDefault();
    }
}

const addDecimalIfApplicable = (name, value, handlerFunction) => {
    if (value) {
        if (value.match(/\d+\.\d(?!\d)/)) {
            let refactoredValue = {name: name, value: value + "0"};
            handlerFunction({}, refactoredValue);
        } else if (value.match(/\d+\.(?!\d)/)) {
            let refactoredValue = {name: name, value: value + "00"};
            handlerFunction({}, refactoredValue);
        } else if (!value.match(/\d+\.\d\d(?!\d)/)) {
            let refactoredValue = {name: name, value: value + ".00"};
            handlerFunction({}, refactoredValue);
        } else {
            handlerFunction({}, {name, value});
        }
    }
}

const multiValueContainer = ({selectProps, data}) => {
    const label = data.label;
    const allSelected = selectProps.value;
    const index = allSelected.findIndex(selected => selected.label === label);
    const isLastSelected = index === allSelected.length - 1;
    const labelSuffix = isLastSelected ? "" : ", ";
    return `${label}${labelSuffix}`;
};

export default FormFieldsComponent;

FormFieldsComponent.propTypes = {
    formFields: PropTypes.exact({
        label: PropTypes.string.isRequired,
        type: (props, propName) => {
            if (typeof props[propName] === "object") {
                return PropTypes.exact({
                    dropdown: PropTypes.oneOfType([
                        PropTypes.element,
                        PropTypes.array
                    ])
                })
            } else {
                return PropTypes.oneOf([
                    'number', 'double', 'date',
                    'text', 'textarea', 'boolean',
                    'data', 'multilineData', 'currencyData'
                ])
            }
        },
        multiSelect: PropTypes.bool,
        isClearable: PropTypes.bool
    }).isRequired,

    formFieldsData: PropTypes.object.isRequired,
    handlerFunction: PropTypes.func.isRequired,

    requiredFields: PropTypes.arrayOf(PropTypes.string),
    columnCount: PropTypes.oneOf([2, 3, 4]),
    fieldContainerWidth: PropTypes.string,
    formClassName: PropTypes.string,
    disableAllFields: PropTypes.bool,
    onFormSubmit: PropTypes.func
}