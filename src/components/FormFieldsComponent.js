import {Button as SemanticButton, Form, Image as SemanticImage, Input, Popup} from "semantic-ui-react";
import question from "../images/question.png";
import Select from "react-select";
import {Col, Container, Row} from "react-bootstrap";
import React, {useState} from "react";
import "../styling/FormsFieldComponent.css";
import PopupComponent from "./PopupComponent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Moment from 'moment';
import {isNotAnEmptyObject} from "../utilities/ObjectVariableValidators";

function FormFieldsComponent(props) {
    let {
        formFields,
        formFieldsData,
        handlerFunction,

        requiredFields,
        columnCount,
        fieldContainerWidth,
        showWildCardMessage,
        formClassName
    } = props;
    requiredFields = requiredFields ? requiredFields : [];
    columnCount = columnCount ? columnCount : 2;
    fieldContainerWidth = fieldContainerWidth ? fieldContainerWidth : "fit-content";
    showWildCardMessage = showWildCardMessage === true;
    formClassName = formClassName ? formClassName : "";

    let initialState = {
        showFieldDetailsPopup: false,
        fieldDetailsData: ""
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

                let isDropdownField = false;

                if (typeof currentFieldType === "object") {
                    isDropdownField = true;

                    let requiredAsterisk;
                    if (isRequired)
                        requiredAsterisk = <b><span style={{color: '#db2828'}}>*</span></b>;

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
                        menuConfig = (provided) => ({...provided, width: currentFieldObject["menuWidth"], zIndex: '1000'});
                    else
                        menuConfig = (provided) => ({...provided, zIndex: '1000'});

                    let selectComponent;
                    if (typeof currentFieldType["dropdown"] === "function") {
                        selectComponent = currentFieldType["dropdown"]({currentField, formFieldsData, handlerFunction, allowMultiSelect, isClearable, menuConfig, columnCount, multiValueContainer})
                    } else {
                        let value;
                        if (Array.isArray(formFieldsData[currentField])) {
                            let optionValues = formFieldsData[currentField].map(v => {
                                return v["value"]
                            });
                            value = currentFieldType["dropdown"].filter(option => (optionValues.includes(option["value"])));
                        } else {
                            value = currentFieldType["dropdown"].filter(option => (option["value"] === formFieldsData[currentField]));
                        }

                        selectComponent = <Select
                            name={currentField}
                            value={value || null}
                            options={currentFieldType["dropdown"]}
                            isClearable={isClearable}
                            onChange={handlerFunction}
                            isMulti={allowMultiSelect}
                            closeMenuOnSelect={!allowMultiSelect}
                            hideSelectedOptions={false}
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
                                    borderColor: 'rgba(34, 36, 38, 0.15)'
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
                        <label key={currentField} style={{paddingTop: '5px'}}>{currentFieldLabel}</label>
                        {selectComponent}
                    </Form.Field>;
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
                        />;
                    } else if (currentFieldType === "date") {
                        let requiredAsterisk;
                        if (isRequired)
                            requiredAsterisk = <b><span style={{color: '#db2828'}}>*</span></b>;

                        form = [
                            <Form.Field style={{width: '280px'}}>
                                <label>{currentFieldLabel} {requiredAsterisk}</label>
                                <DatePicker
                                    selected={formFieldsData[currentField] ?
                                        new Date(Moment(formFieldsData[currentField], "MM/DD/YYYY")) :
                                        undefined}
                                    onChange={date => handlerFunction({}, {"name": currentField, "value": date})}
                                    dateFormat={"MM/dd/yyyy"}
                                    placeholderText="mm/dd/yyyy"
                                    isClearable
                                    showMonthDropdown
                                    showYearDropdown
                                    scrollableYearDropdown
                                    todayButton={"Today"}
                                />
                            </Form.Field>
                        ];
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
                                <SemanticButton size='mini' compact onClick={() => setState({
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

                        if (typeof dataValue === "number") {
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
                        />
                    } else {
                        if (currentFieldTooltipMsg) {
                            form = <Form.Field>
                                <label>
                                    {currentFieldLabel}

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
                            />;
                        }
                    }
                }

                let columnWidth = 12 / columnCount;

                columns.push(<Col key={fieldCount} xs={columnWidth} className={'formFieldsCol'}>
                    <Form key={currentField} size='mini' style={{fontSize: '13px'}}>
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

    let wildCardMessage;
    if (showWildCardMessage === true && isNotAnEmptyObject(formFields))
        wildCardMessage = <p style={{fontStyle: "italic", fontSize: "small", marginBottom: "10px", marginTop: "10px"}}>
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
                                           closeToggled={(value) => value && setState({
                                               showFieldDetailsPopup: false,
                                               fieldDetailsData: ""
                                           })}/>;

    return <Container style={{padding: '5px 15px 0 5px', margin: 0, maxWidth: fieldContainerWidth}} className={formClassName}>
        {rows}
        {wildCardMessage}
        {fieldDetailsPopup}
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