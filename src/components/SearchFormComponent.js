import React from 'react';
import {Alert, Button as BootstrapButton, Card, Container, Image, Nav, Navbar, Row} from "react-bootstrap";
import {Button, Dimmer, Divider, Dropdown, Icon, Loader, Popup} from "semantic-ui-react";
import Moment from 'moment';
import ReactExport from "react-data-export";
import GridComponent from "./GridComponent";
import MaskComponent from "./MaskComponent";
import {isANumber} from "../utilities/NumberVariableValidator";
import {isNotAnEmptyObject} from "../utilities/ObjectVariableValidators";
import {isNotAnEmptyArray} from "../utilities/ArrayVariableValidators";
import FormFieldsComponent from "./FormFieldsComponent";
import filter from "../images/filter_detail.gif";
import reset from '../images/reset.png';
import mainSearch from '../images/mainSearchIcon.gif';
import {Table} from "@devexpress/dx-react-grid-bootstrap4";
import {connect} from "react-redux";
import {isNotEmptyString} from "../utilities/StringVariableValidators";
import PopupComponent from "./PopupComponent";
import PropTypes from 'prop-types';

//Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css';
import "react-datepicker/dist/react-datepicker.css";
import "../styling/SearchFormComponent.css";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class SearchFormComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        const {config} = props;
        const {
            searchFormFields,
            searchFormFieldsColumnCount,
            searchFormFieldsContainerWidth,
            searchFormDefaultValues,
            searchID,
            searchHandler,
            requiredFields,
            formClassName,
            searchMenuOptions,
            isMetrics,
            hasNavOptions,
            showWildCardMessage,

            searchGridColumns,
            searchGridColumnWidths,
            allowRowSelection,
            tableCellConfig,
            sortingColumnExtensions,
            searchGridWidth,
            searchGridHiddenColumns,
            allowRowDetails,
            rowDetailsContent,

            //TODO: Delete dummy data below
            dummyData
        } = config;

        let searchFormValues = {};
        if (isNotAnEmptyObject(searchFormDefaultValues))
            searchFormValues = Object.assign({}, searchFormDefaultValues);

        let searchMenuOptionProps = {};
        if (isNotAnEmptyArray(searchMenuOptions)) {
            searchMenuOptions.forEach(v => {
                if (v.hasOwnProperty("subMenuItems")) {
                    this.generateSubMenuSearchOptionProps(searchMenuOptionProps, v);
                } else {
                    let {dependsOnRowSelection} = v;
                    dependsOnRowSelection = dependsOnRowSelection === true;
                    searchMenuOptionProps[v["key"]] = {...v, dependsOnRowSelection};
                }
            })
        }

        this.state = {

            // ----- Configurable -----
            config,
            searchFormFields: isNotAnEmptyObject(searchFormFields) ? searchFormFields : {},
            searchMenuOptions: isNotAnEmptyArray(searchMenuOptions) ? searchMenuOptions : [],
            searchMenuOptionProps,
            searchFormFieldsColumnCount: isANumber(searchFormFieldsColumnCount) ? searchFormFieldsColumnCount : 2,
            searchFormFieldsContainerWidth: isNotEmptyString(searchFormFieldsContainerWidth) ? searchFormFieldsContainerWidth : 'fit-content',
            searchID,
            searchHandler,
            isMetrics: isMetrics === true,
            hasNavOptions: hasNavOptions !== false,
            allowRowDetails: allowRowDetails === true,
            rowDetailsContent: rowDetailsContent,
            showWildCardMessage: showWildCardMessage !== false,

            searchGridColumns: isNotAnEmptyArray(searchGridColumns) ? searchGridColumns : [],
            searchGridColumnWidths: isNotAnEmptyObject(searchGridColumnWidths) ? searchGridColumnWidths : {},
            allowRowSelection: allowRowSelection === true ? allowRowSelection : false,
            tableCellConfig: tableCellConfig ? tableCellConfig : undefined,
            sortingColumnExtensions,
            searchGridWidth,
            searchGridHiddenColumns: isNotAnEmptyArray(searchGridHiddenColumns) ? searchGridHiddenColumns : [],
            // ------------------------

            searchFormValues,
            searchCriteria: {},
            requiredFields: isNotAnEmptyArray(requiredFields) ? requiredFields : [],
            formClassName: formClassName && formClassName !== "" ? formClassName : "",

            //Search Grid
            // searchResultsRows: [],
            // TODO: Delete below and uncomment above
            searchResultsRows: isNotAnEmptyArray(dummyData) ? dummyData : [],

            searchGridSorting: [],
            searchGridLoading: false,
            searchResultsTotal: 0,
            pageSize: 25,
            currentPage: 0,

            selectedRows: [],
            resetSelections: false,
            refreshToggled: false,
            openTableCellPopup: false,

            showLoadingMask: false,
            exportData: [],
            showDownloadExportPrompt: false,

            showAlertMsg: false,
            alertMsg: ""
        };

        //Nav-header options
        this.handleSearchServicesNavSelect = this.handleSearchServicesNavSelect.bind(this);

        //Search form fields handlers
        this.handleSearchFormValue = this.handleSearchFormValue.bind(this);
        this.performSearch = this.performSearch.bind(this);

        //Actions options
        this.generateExcelFile = this.generateExcelFile.bind(this);

        //For remote sorting
        this.changeSelectedSorting = this.changeSelectedSorting.bind(this);

        //For remote paging
        this.changePageSize = (pageSize) => this.setState({
            currentPage: 0,
            pageSize: pageSize,
            searchGridLoading: true
        }, this.performSearch);
        this.changeCurrentPage = (currentPage) => this.setState({
            currentPage: currentPage,
            searchGridLoading: true
        }, this.performSearch);

        //Other helper methods
        this.getSelectedRows = (values) => this.setState({selectedRows: values});
        this.reformatSearchFieldsForOutbound = this.reformatSearchFieldsForOutbound.bind(this);
        this.reformatSearchResultsResponse = this.reformatSearchResultsResponse.bind(this);
        this.resetDownloadFileCallback = this.resetDownloadFileCallback.bind(this);
        this.handlePopupCallback = this.handlePopupCallback.bind(this);
        this.generateSubMenuSearchOptionProps = this.generateSubMenuSearchOptionProps.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {searchID, searchGridLoading, refreshToggled} = this.state;
        const {config, searchResults} = this.props;

        if (prevProps["searchResults"] !== searchResults && isNotAnEmptyObject(searchResults[searchID])) {
            const {rows, size, hasError, errorMessage} = searchResults[searchID];

            if (hasError) {
                this.setState({
                    searchGridLoading: false,
                    searchResultRows: [],
                    searchResultsTotal: 0,
                    downloadFileCallback: undefined,
                    downloadFileData: undefined,
                    showAlertMsg: true,
                    alertMsg: isNotEmptyString(errorMessage) ? errorMessage : "Something went wrong while retrieving grid data. Please try again later."
                })
            } else {
                this.setState({
                    showAlertMsg: false,
                    alertMsg: "",
                    searchGridLoading: false,
                    searchResultsRows: rows,
                    searchResultsTotal: size,
                    downloadFileCallback: undefined,
                    downloadFileData: undefined,
                    refreshToggled: false
                }, () => refreshToggled === true && this.setState({refreshToggled: false}));
            }
        } else if (searchGridLoading) {
            this.setState({
                showAlertMsg: false,
                alertMsg: "",
                searchGridLoading: false,
                downloadFileCallback: undefined,
                downloadFileData: undefined,
            })
        }

        if (prevState["config"] !== config) {
            const {
                searchFormFields,
                searchFormFieldsColumnCount,
                searchFormFieldsContainerWidth,
                searchFormDefaultValues,
                searchID,
                searchHandler,
                requiredFields,
                formClassName,
                searchMenuOptions,
                isMetrics,
                hasNavOptions,

                searchGridColumns,
                searchGridColumnWidths,
                allowRowSelection,
                tableCellConfig,
                sortingColumnExtensions,
                searchGridWidth,
                searchGridHiddenColumns,
                allowRowDetails,
                rowDetailsContent,

                //TODO: Delete dummy data below
                dummyData
            } = config;

            let searchFormValues = {};
            if (prevState["config"][searchFormDefaultValues] !== config["searchFormDefaultValues"]
                && isNotAnEmptyObject(searchFormDefaultValues)) {
                   searchFormValues = Object.assign({}, searchFormDefaultValues);
            } else {
                searchFormValues = Object.assign({}, this.state.searchFormValues)
            }

            let searchMenuOptionProps = {};
            if (isNotAnEmptyArray(searchMenuOptions)) {
                searchMenuOptions.forEach(v => {
                    let {dependsOnRowSelection, onClickHandler, action} = v;
                    dependsOnRowSelection = dependsOnRowSelection === true;
                    searchMenuOptionProps[v["key"]] = {dependsOnRowSelection, action, onClickHandler};
                })
            }

            this.setState({
                // ----- Configurable -----
                config,
                searchFormFields: isNotAnEmptyObject(searchFormFields) ? searchFormFields : {},
                searchMenuOptions: isNotAnEmptyArray(searchMenuOptions) ? searchMenuOptions : [],
                searchMenuOptionProps,
                searchFormFieldsColumnCount: isANumber(searchFormFieldsColumnCount) ? searchFormFieldsColumnCount : 2,
                searchFormFieldsContainerWidth: isNotEmptyString(searchFormFieldsContainerWidth) ? searchFormFieldsContainerWidth : 'fit-content',
                searchID,
                searchHandler,
                isMetrics: isMetrics === true,
                hasNavOptions: hasNavOptions !== false,
                allowRowDetails: allowRowDetails === true,
                rowDetailsContent: rowDetailsContent,

                searchGridColumns: isNotAnEmptyArray(searchGridColumns) ? searchGridColumns : [],
                searchGridColumnWidths: isNotAnEmptyObject(searchGridColumnWidths) ? searchGridColumnWidths : {},
                allowRowSelection: allowRowSelection === true ? allowRowSelection : false,
                tableCellConfig: tableCellConfig ? tableCellConfig : undefined,
                sortingColumnExtensions,
                searchGridWidth,
                searchGridHiddenColumns: isNotAnEmptyArray(searchGridHiddenColumns) ? searchGridHiddenColumns : [],
                // ------------------------

                searchFormValues,
                searchCriteria: {},
                requiredFields: isNotAnEmptyArray(requiredFields) ? requiredFields : [],
                formClassName: formClassName && formClassName !== "" ? formClassName : "",

                //Search Grid
                // searchResultsRows: [],
                // TODO: Delete below and uncomment above
                searchResultsRows: isNotAnEmptyArray(dummyData) ? dummyData : [],
            })
        }
    }

    generateSubMenuSearchOptionProps(propsObj, searchMenuOption) {
        searchMenuOption["subMenuItems"].forEach(option => {
            if (option.hasOwnProperty("subMenuItems"))
                this.generateSubMenuSearchOptionProps(propsObj, option);
            else {
                let {dependsOnRowSelection} = option;
                dependsOnRowSelection = dependsOnRowSelection === true;
                propsObj[option["key"]] = {...option, dependsOnRowSelection};
            }
        })
    }

    handleSearchServicesNavSelect(eventKey) {
        const {config} = this.props;
        const {searchFormDefaultValues} = config;
        const {searchMenuOptionProps, selectedRows} = this.state;

        switch (eventKey) {
            case "Search":
                this.setState({
                    searchGridLoading: true,
                    searchGridSorting: [],
                    currentPage: 0
                }, this.performSearch);
                break;
            case "Reset":
                let searchFormValues = {};
                if (isNotAnEmptyObject(searchFormDefaultValues))
                    searchFormValues = Object.assign({}, searchFormDefaultValues);

                this.setState({
                    searchFormValues,
                    searchResultsRows: [],
                    searchResultsTotal: 0,
                    selectedRows: [],
                    resetSelections: true,
                    searchGridSorting: [],
                    showAlertMsg: false,
                    alertMsg: ""
                });
                break;
            default: {
                if (Object.keys(searchMenuOptionProps).includes(eventKey)) {
                    const {
                        dependsOnRowSelection,
                        action,
                        onClickHandler,
                        popupHeader,
                        popupContent,
                        popupClassName
                    } = searchMenuOptionProps[eventKey];

                    if (dependsOnRowSelection) {
                        if (isNotAnEmptyArray(selectedRows)) {
                            if (action === "downloadFile") {
                                this.setState({
                                    showAlertMsg: false,
                                    alertMsg: "",
                                    downloadFileCallback: onClickHandler,
                                    downloadFileData: selectedRows
                                });
                            } else if (action === "openPopup") {
                                this.setState({
                                    showTableCellPopup: true,
                                    popupHeader,
                                    popupContent: popupContent(selectedRows, this.handlePopupCallback),
                                    popupClassName
                                })
                            } else {
                                this.setState({
                                    showAlertMsg: false,
                                    alertMsg: "",
                                }, onClickHandler(selectedRows));
                            }
                        } else {
                            this.setState({
                                showAlertMsg: true,
                                alertMsg: "Please select at least one record to perform this action."
                            })
                        }
                    } else {
                        onClickHandler();
                    }
                }
            }
        }
    }

    handleSearchFormValue(e, {name, value}) {
        let {searchFormValues, searchFormFields} = this.state;

        let dropdownFields = Object.keys(searchFormFields).filter(field => (typeof searchFormFields[field]["type"] === "object"));
        if (dropdownFields.includes(name)) {
            if (Array.isArray(e))
                value = e;
            else
                value = e && e["value"] ? e["value"] : null;
        }

        let newSearchFormValues = {};
        Object.keys(searchFormValues).forEach(prop => {
            if (name !== prop)
                newSearchFormValues[prop] = searchFormValues[prop];
        });

        if (value) {
            newSearchFormValues[name] = value;

            if (name === "sortBy" && !newSearchFormValues.hasOwnProperty("sortByDesc"))
                newSearchFormValues["sortByDesc"] = false;
        }

        if (name === "sortBy" && !value) {
            this.setState({searchFormValues: newSearchFormValues, searchGridSorting: []});
        } else {
            this.setState({searchFormValues: newSearchFormValues});
        }
    }

    changeSelectedSorting(sorting) {
        const {searchFormValues} = this.state;
        let {columnName, direction} = sorting[0];

        let newSearchFormValues = {};
        Object.keys(searchFormValues).forEach(prop => {
            if (!["sortBy", "sortByDesc"].includes(prop))
                newSearchFormValues[prop] = searchFormValues[prop];
        })
        newSearchFormValues["sortBy"] = columnName;
        newSearchFormValues["sortByDesc"] = direction === "desc";

        this.setState({
            searchFormValues: newSearchFormValues,
            searchGridLoading: true
        }, this.performSearch);
    }

    reformatSearchFieldsForOutbound(searchFormValues) {
        if (isNotAnEmptyObject(searchFormValues)) {
            let refactoredSearchFormValues = {};
            Object.keys(searchFormValues)
                .forEach(prop => {
                    if (prop.toLowerCase().includes("date") && searchFormValues[prop]) {
                        let refactoredDate = Moment(searchFormValues[prop]).format("YYYY-MM-DD");

                        if (!refactoredDate.toLowerCase().includes("invalid"))
                            refactoredSearchFormValues[prop] = refactoredDate;
                    } else if (Array.isArray(searchFormValues[prop]))
                        refactoredSearchFormValues[prop] = searchFormValues[prop].map(v => {return v["value"];})
                    else
                        refactoredSearchFormValues[prop] = searchFormValues[prop];
                });

            return refactoredSearchFormValues;
        } else {
            return {};
        }
    }

    reformatSearchResultsResponse(searchResults) {
        if (isNotAnEmptyArray(searchResults)) {
            return searchResults.map(row => {
                let rowObj = {};
                Object.keys(row).forEach(prop => {
                    //Reformatting date value
                    if ((prop.includes("Date") || prop === "RDD") && row[prop] != null)
                        rowObj[prop] = Moment(row[prop]).format("MM/DD/YYYY");
                    else if (prop === "MaxDollarAmt" || prop === "TDLPrice") {
                        let usdFormat = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        });
                        rowObj[prop] = usdFormat.format(row[prop]);
                    } else if (prop === "IsActive")
                        rowObj[prop] = row[prop] === "1" ? "true" : "false";
                    else
                        rowObj[prop] = row[prop];
                });

                return rowObj;
            });
        } else {
            return [];
        }
    }

    performSearch(refreshToggled = false) {
        const {searchFormValues, currentPage, pageSize} = this.state;

        let refactoredSearchFormValues = this.reformatSearchFieldsForOutbound(searchFormValues);
        refactoredSearchFormValues["page"] = currentPage;
        refactoredSearchFormValues["start"] = pageSize * currentPage;
        refactoredSearchFormValues["limit"] = pageSize;

        this.setState({searchCriteria: refactoredSearchFormValues, refreshToggled: refreshToggled});
    }

    generateExcelFile() {
        const {
            searchGridColumns,
            searchResultsRows,
        } = this.state;

        let dataSet = {};

        dataSet["columns"] = searchGridColumns
            .map(column => {
                return {
                    title: column["title"],
                    style: {font: {bold: true}, fill: {patternType: "solid", fgColor: {rgb: "33CCCC"}}}
                };
            });

        let dataRows = this.reformatSearchResultsResponse(searchResultsRows);

        dataSet["data"] = dataRows.map(row => {
            return searchGridColumns
                .map(column => {
                    let value = row[column["name"]];
                    if (value)
                        return {value: value};
                    else
                        return {value: ""};
                });
        });

        this.setState({
            showLoadingMask: false,
            showDownloadExportPrompt: true,
            exportData: [dataSet],
            showAlertMsg: false,
            alertMsg: ""
        })
    }

    resetDownloadFileCallback() {
        this.setState({downloadFileCallback: undefined, downloadFileData: undefined})
    }

    handlePopupCallback(callbackAction, targetTab, dataToPassToTab) {
        const {tabToOpen} = this.props;

        switch(callbackAction) {
            case "transferTab":
                this.setState({showTableCellPopup: false}, tabToOpen(targetTab, dataToPassToTab))
                break;
            case "closePopup":
                this.setState({showTableCellPopup: false});
                break;
            default:
                break;
        }
    }

    render() {
        const {tabToOpen} = this.props;
        const {
            searchFormFields, searchFormFieldsColumnCount, searchFormFieldsContainerWidth,
            searchFormValues, requiredFields, showWildCardMessage, formClassName,
            searchMenuOptions, searchGridHiddenColumns,
            searchGridColumns, searchGridColumnWidths, allowRowSelection, tableCellConfig, searchGridWidth,
            isMetrics, hasNavOptions, refreshToggled, allowRowDetails, rowDetailsContent,
            showTableCellPopup, popupHeader, popupContent, popupClassName,

            downloadFileCallback, downloadFileData,
            searchHandler, searchID, searchCriteria,
            searchResultsRows, searchResultsTotal, searchGridLoading,
            searchGridSorting, sortingColumnExtensions,
            showDownloadExportPrompt, showLoadingMask, exportData,
            selectedRows, resetSelections, currentPage, pageSize,
            showAlertMsg, alertMsg, commodityUiActions, commodityUiPermissions,
        } = this.state;

        let searchFields = <FormFieldsComponent formFields={searchFormFields}
                                                formFieldData={searchFormValues}
                                                handlerFunction={this.handleSearchFormValue}
                                                requiredFields={requiredFields}
                                                columnCount={searchFormFieldsColumnCount}
                                                fieldContainerWidth={searchFormFieldsContainerWidth}
                                                showWildCardMessage={showWildCardMessage}
                                                formClassName={formClassName}/>;

        let generateSubMenu = (subMenu) => {
            let links = [];
                subMenu["subMenuItems"].forEach(menuOption => {
                    if (menuOption["key"].toLowerCase() === "divider")
                        links.push(<Dropdown.Divider/>)
                    else if (menuOption.hasOwnProperty("subMenuItems"))
                        links.push(generateSubMenu(menuOption));
                    else {
                        let onClickCallback = () => this.handleSearchServicesNavSelect(menuOption["key"]);

                        links.push(
                            <Dropdown.Item key={menuOption["key"]}
                                           text={<span>
                                               {menuOption.hasOwnProperty("image") && <Image src={menuOption["image"]}/>}
                                               {menuOption.hasOwnProperty("icon") && <Icon name={menuOption["icon"]}/>}
                                               {menuOption["title"]}
                                           </span>}
                                           onClick={onClickCallback}/>
                        );
                    }
                })

            return (
                <Dropdown text={<span>
                                {subMenu.hasOwnProperty("image") && <Image src={subMenu["image"]}/>}
                                {subMenu.hasOwnProperty("icon") && <Icon name={subMenu["icon"]}/>}
                                {subMenu["title"]}
                            </span>}
                          className={"searchMenu"}>

                    <Dropdown.Menu direction={'right'}>
                        {links}
                    </Dropdown.Menu>
                </Dropdown>
            );
        }

        let menuOptions = [];
        if (isNotAnEmptyArray(searchMenuOptions)) {
            searchMenuOptions.forEach(option => {
                if (option["key"].toLowerCase() === "divider")
                    option.push(<Dropdown.Divider/>)
                else if (option.hasOwnProperty("subMenuItems")) {
                    let subMenuItems = generateSubMenu(option);
                    menuOptions.push(subMenuItems);
                } else {
                    menuOptions.push(
                        <Nav.Link eventKey={option["key"]}>
                            {option.hasOwnProperty("image") && option["image"] && <Image src={option["image"]}/>}
                            {option.hasOwnProperty("icon") && option["icon"] && <Icon name={option["icon"]}/>}
                            {option["title"]}
                        </Nav.Link>
                    );
                }
            })
        }

        let exportToExcelOption;
        if (searchResultsRows && searchResultsRows.length > 0) {
            exportToExcelOption = <Button color='green' size='small' compact basic icon labelPosition={'left'}
                        onClick={() => {
                            if (showDownloadExportPrompt)
                                this.setState({
                                    showDownloadExportPrompt: false,
                                    showLoadingMask: true
                                }, this.generateExcelFile);
                            else
                                this.setState({showLoadingMask: true}, this.generateExcelFile);
                        }}> <Icon name='file excel'/> Export </Button>
        }

        let exportPrompt;
        if (showDownloadExportPrompt) {
            exportPrompt = <ExcelFile hideElement={true} filename={"export"}><ExcelSheet dataSet={exportData}
                                                                                         name="export"/></ExcelFile>
        }

        let alertMessage;
        if (showAlertMsg) {
            alertMessage = <Row>
                <Alert key={'required'}
                       variant={'danger'}
                       style={{width: '100%', margin: '5px 18px 0px'}}> {alertMsg} </Alert>
            </Row>;
        }

        let generateTableCellDropdown = (menuOptions, rowData, column) => {
            let links = [];
            menuOptions.forEach(menuOption => {
                let onClickCallback;
                if (menuOption.hasOwnProperty("action")) {
                    const {action, onClickHandler, targetTab} = menuOption;

                    switch(action) {
                        case "downloadFile":
                            onClickCallback = () => this.setState({
                                downloadFileCallback: onClickHandler,
                                downloadFileData: rowData
                            });
                            break;
                        case "transferTab":
                            onClickCallback = () => tabToOpen(targetTab, {rowData, column});
                            break;
                        default:
                            break;
                    }
                }

                links.push(
                    <Dropdown.Item key={menuOption["key"]}
                                   onClick={onClickCallback}
                                   text={<span>
                                           <span style={{marginRight: "25px"}}>
                                                {menuOption.hasOwnProperty("image") && <Image src={menuOption["image"]}/>}
                                                {menuOption.hasOwnProperty("icon") && <Icon name={menuOption["icon"]}/>}
                                           </span>

                                           <span>
                                                {menuOption["title"]}
                                           </span>
                                       </span>}
                                   />
                );
            })

            return (
                <Popup trigger={<Icon name={"caret square down"} style={{display: "unset !important"}}/>}
                       hoverable
                       position='bottom left'
                       className={"tableCellPopup"}
                       style={{zIndex: "1000"}}>
                    {links}
                </Popup>
            );
        }

        let tableCell;
        if (isNotAnEmptyObject(tableCellConfig)) {
            let clickableColumnCells = Object.keys(tableCellConfig)
                                            .filter(v => ["transferTab", "downloadFile", "openPopup"].includes(tableCellConfig[v].action));

            tableCell = ({row, column, ...restProps}) => {
                return <Table.Cell
                    {...restProps}
                    onClick={() => {
                        if (Object.keys(tableCellConfig).includes(column.name)) {
                            const {
                                action, targetTab, onClickHandler,
                                popupHeader, popupContent, popupClassName
                            } = tableCellConfig[column.name];

                            switch(action) {
                                case "transferTab":
                                    tabToOpen(targetTab, {row, column});
                                    break;
                                case "downloadFile":
                                    this.setState({downloadFileCallback: onClickHandler, downloadFileData: row})
                                    break;
                                case "openPopup":
                                    this.setState({
                                        showTableCellPopup: true,
                                        popupHeader,
                                        popupContent: popupContent(row, this.handlePopupCallback),
                                        popupClassName
                                    })
                                    break;
                                default:
                                    break;
                            }
                        }
                    }}
                    style={{
                        color: clickableColumnCells.includes(column.name) ? 'blue' : undefined,
                        cursor: clickableColumnCells.includes(column.name) ? 'pointer' : undefined,
                        textDecoration: clickableColumnCells.includes(column.name) ? 'underline' : undefined
                    }}
                >
                    {Object.keys(tableCellConfig).includes(column.name)
                            && tableCellConfig[column.name].action === "openDropdown"
                                && tableCellConfig[column.name].hasOwnProperty("dropdownOptions")
                                    && isNotAnEmptyArray(tableCellConfig[column.name]["dropdownOptions"])
                                        && generateTableCellDropdown(tableCellConfig[column.name]["dropdownOptions"], row, column)}
                </Table.Cell>
            };
        }

        let navOptions;
        if (isMetrics) {
            navOptions = <Nav.Link eventKey={"Search"}>
                <Image src={filter}/> Filter
            </Nav.Link>;
        } else {
            navOptions = [
                <Nav.Link eventKey={"Reset"}>
                    <Image src={reset}/> Reset
                </Nav.Link>,
                <Nav.Link eventKey={"Search"}>
                    <Image src={mainSearch}/> Search
                </Nav.Link>
            ]
        }

        let navBar;
        if (hasNavOptions)
            navBar = <Card.Header>
                <Navbar variant="light">
                    <Nav className="mr-auto" onSelect={k => this.handleSearchServicesNavSelect(k)}>
                        {navOptions}
                        {menuOptions}
                    </Nav>
                </Navbar>
            </Card.Header>;

        let tableCellPopup;
        if (showTableCellPopup) {
            let additionalClassName = "searchFormTableCellPopup";
            if (isNotEmptyString(popupClassName))
                additionalClassName += " " + popupClassName;

            tableCellPopup = <PopupComponent header={popupHeader}
                                             content={popupContent}
                                             footerConfig={"custom"}
                                             ustomFooter={<BootstrapButton variant={"secondary"}
                                                                           onClick={() => this.setState({showTableCellPopup: false})}
                                                                           style={{borderRadius: "0%"}}>
                                                 Close </BootstrapButton>}
                                             closeToggled={() => this.setState({showTableCellPopup: false})}
                                             className={additionalClassName}
            />
        }

        let searchHandlerElement;
        if (typeof searchHandler === "function")
            searchHandlerElement = searchHandler(searchID, searchCriteria, refreshToggled);

        return (
            <div style={{padding: '5px 10px', fontSize: '12px'}}>
                <Card>
                    {navBar}

                    <Card.Body>
                        {alertMessage}
                        {searchFields}

                        {isNotAnEmptyObject(searchFormFields) && <Divider className={searchFormFieldsColumnCount === 3 ? "searchDivider-3" : "searchDivider-2"}/>}

                        <Row style={{paddingLeft: '10px', maxWidth: searchGridWidth}}>
                            <Container fluid style={{overflow: 'auto'}}>
                                <Row noGutters={true}>
                                        <div>
                                            <Dimmer active={searchGridLoading} inverted>
                                                <Loader content={'Retrieving Search Results'}/>
                                            </Dimmer>
                                            <GridComponent columns={searchGridColumns}
                                                           rows={searchResultsRows}
                                                           tableCell={tableCell}
                                                           columnWidths={searchGridColumnWidths}
                                                           hiddenColumns={searchGridHiddenColumns}
                                                           viewConfig={isMetrics ? "simple" : "bare"}

                                                           gridContainerClass={"searchGrid"}
                                                           gridSorting={searchGridSorting}
                                                           sortingColumnExtensions={sortingColumnExtensions}

                                                           refreshToggled={() => this.performSearch(true)}

                                                           pageConfig={[pageSize, [25, 50, 100, 500, 1000, 2500]]}
                                                           remotePaging={true}
                                                           totalCount={searchResultsTotal}
                                                           currentPage={currentPage}
                                                           changeCurrentPage={this.changeCurrentPage}
                                                           currentPageSize={pageSize}
                                                           changeCurrentPageSize={this.changePageSize}

                                                           remoteSorting={true}
                                                           selectedSorting={this.changeSelectedSorting}

                                                           toggleSelect={allowRowSelection}
                                                           allowSelectAll={true}
                                                           selectedValues={this.getSelectedRows}
                                                           resetSelections={resetSelections}
                                                           selectionsWereReset={(value) => value && this.setState({
                                                               selectedRows: [],
                                                               resetSelections: false
                                                           })}

                                                           rowDetailsEnabled={allowRowDetails}
                                                           rowDetailsContent={allowRowDetails && rowDetailsContent}
                                            />
                                        </div>
                                </Row>
                            </Container>
                        </Row>

                        <div style={{maxWidth: searchGridWidth}}>
                            {exportToExcelOption}
                            <h5 style={{paddingRight: "20px", marginTop: 0, float: "right"}}> Total: {searchResultsTotal} </h5>
                        </div>

                    </Card.Body>
                </Card>

                <MaskComponent header={"Please Wait"} content={"Generating File"}
                               show={showLoadingMask}
                               loadingIcon={true}/>

                {searchHandlerElement}
                {exportPrompt}
                {downloadFileCallback && downloadFileCallback(downloadFileData, this.resetDownloadFileCallback)}
                {tableCellPopup}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {reducerID} = props.config;

    let stateObject = Object.assign({}, state);
    if (Array.isArray(reducerID)) {
        reducerID.forEach(prop => {
            stateObject = Object.assign({}, stateObject[prop]);
        })
    } else {
        stateObject = Object.assign({}, state[reducerID]);
    }

    return {
        searchResults: stateObject
    }
}

export default connect(mapStateToProps, null)(SearchFormComponent);

//=========================================== DOCUMENTATIONS ===========================================================
SearchFormComponent.propTypes = {
    configs: PropTypes.shape({
        searchFormFields: PropTypes.shape({
            label: PropTypes.string.isRequired,
            type: (props, propName) => {
                if (typeof props[propName] === "object") {
                    return PropTypes.shape({
                        dropdown: PropTypes.oneOfType([
                            PropTypes.element,
                            PropTypes.array
                        ])
                    })
                } else
                    return PropTypes.string.isRequired
            },
            multiSelect: PropTypes.bool,
            isClearable: PropTypes.bool
        }),
        isMetrics: PropTypes.bool,
        hasNavOptions: PropTypes.bool,
        searchFormDefaultValues: PropTypes.object,
        searchFormFieldsColumnCount: PropTypes.number,
        searchFormFieldsContainerWidth: PropTypes.string,
        searchMenuOptions: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            image: PropTypes.any,
            icon: PropTypes.string,
            dependsOnRowSelection: PropTypes.bool,
            action: PropTypes.oneOf(["downloadFile", "openPopup"]).isRequired,

            popupHeader: (props, propName) => {
                if (props['action'] === "openPopup")
                    return PropTypes.string.isRequired;
            },
            popupClassName: (props, propName) => {
                if (props['action'] === "openPopup")
                    return PropTypes.string;
            },
            popupContent: (props, propName) => {
                if (props['action'] === "openPopup")
                    return PropTypes.element.isRequired;
            },

            onClickHandler: PropTypes.func.isRequired,
            subMenuItems: PropTypes.array,
        })),

        reducerID: PropTypes.array.isRequired,
        searchID: PropTypes.string.isRequired,
        searchHandler: PropTypes.func.isRequired,
        searchGridColumns: PropTypes.array,
        allowRowSelection: PropTypes.bool,
        allowRowDetails: PropTypes.bool,
        rowDetailsContent: PropTypes.element,
        searchGridColumnWidths: PropTypes.object,
        searchGridHiddenColumns: PropTypes.array,
        searchGridWidth: PropTypes.string,
        tableCellConfig: PropTypes.shape({
            action: PropTypes.oneOf(["downloadFile", "openDropdown", "openPopup", "transferTab"]).isRequired,
            onClickHandler: PropTypes.func,

            popupHeader: (props, propName) => {
                if (props['action'] === "openPopup")
                    return PropTypes.string.isRequired;
            },
            popupClassName: (props, propName) => {
                if (props['action'] === "openPopup")
                    return PropTypes.string;
            },
            popupContent: (props, propName) => {
                if (props['action'] === "openPopup")
                    return PropTypes.element.isRequired;
            },

            dropdownOptions: (props, propName) => {
                if (props['action'] === "openDropdown")
                    return PropTypes.shape({
                        key: PropTypes.string.isRequired,
                        title: PropTypes.string.isRequired,
                        image: PropTypes.any,
                        icon: PropTypes.string,
                        action: PropTypes.oneOf(["downloadFile", "transferTab"]).isRequired,
                        onClickHandler: PropTypes.func.isRequired
                    }).isRequired;
            },
        })

    }).isRequired,

    tabToOpen: PropTypes.func
}