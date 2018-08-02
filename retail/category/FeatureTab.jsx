import React, {Component,PureComponent,Fragment} from 'react';
import update from 'immutability-helper';

class FeatureTab extends PureComponent {

  constructor(props) {
    super(props);
    this.getCategories = this.getCategories.bind(this);
    this.getCategory = this.getCategory.bind(this);
    this.editCategory = this.editCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.changeStatusCategory = this.changeStatusCategory.bind(this);
    this.viewItems = this.viewItems.bind(this);
    this.handleSortable = this.handleSortable.bind(this);
    this.category = null;
    this.categoryId = null;
    this.categoryIndex = null;
    this.setHeight = false;
    this.getInitialCat = true;
    this.animateCat = false;
    this.state = {
      hotel_id: $('#global-hotel-ddl').val(),
      is_loading: true,
      categories: [],
      lang_code: 'en'
    }
  }

  componentDidMount() {
    this.initialJS(this);
    if(this.props.index == 0){
      this.getInitialCat = false;
      this.getCategories();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.sortable(this);
    try{
      $('.thumbTitle.datatooltip').tooltip('update');
    }catch(e){}
    $('.thumbTitle.datatooltip').tooltip({trigger: "hover"});
    if(this.setHeight){
      this.setHeight = false;
      setTimeout(() => window.setAddCatBoxHeight(), 50);
    }

    if(this.animateCat){
      this.animateCat = false;
      $('#tab-feature-' + this.props.index +  ' .retail-category-list').show().addClass('fadeInUp');
      setTimeout(() => window.setAddCatBoxHeight(), 500);
    }
  }

  componentWillReceiveProps(nextProps){
    let updateCatList = nextProps.updateCatList,
    featureId = this.props.feature.feature_id;
    if(updateCatList.hasOwnProperty(featureId)){
      this.getCategory(updateCatList[featureId]);
    }
  }

  getCategories(){
    let _this = this;
    $.ajax({
      url: SITE_URL + "request/api/categorylist",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.state.hotel_id,
          lang_code: this.state.lang_code,
          feature_id: this.props.feature.feature_id
        }
      },
      dataType: 'json',
      beforeSend: () => {
        if(!_this.state.is_loading){
          _this.setState({
            is_loading: true,
          });
        }
      },
      complete: () => {},
      success: (response, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect(response);
        let categories = [];
        if (response.status)
          categories = response.data[this.state.hotel_id][this.state.lang_code];

        _this.setHeight = true;
        _this.animateCat = true
        _this.setState({
          is_loading: false,
          categories: categories
        })
      },
      error: (jqXHR) => {
        _this.setState({
          is_loading: false
        })
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  getCategory(categoryId){
    let _this = this,
    category = _.findWhere(this.state.categories, { 'cat_id': categoryId}),
    categoryIndex = this.state.categories.indexOf(category);
    $.ajax({
      url: SITE_URL + "request/api/getRetailCategory",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.state.hotel_id,
          lang_code: this.state.lang_code,
          cat_id: categoryId
        }
      },
      dataType: 'json',
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect({response_tag:response_tag});
        if (status){
          _this.setState({
            categories: update(_this.state.categories, {
              [categoryIndex]: {$set: data[_this.state.hotel_id][_this.state.lang_code][0]}
            })
          });
        }
      },
      error: (jqXHR) => {
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  editCategory(index){
    let category = this.state.categories[index];
    this.category = category;
    this.categoryId = category.cat_id;
    this.categoryIndex = index;
    this.props.onEdit(index, category);
  }

  deleteCategory(categoryIndex, actionType){
    let _this = this,
    category = this.state.categories[categoryIndex],
    categoryId = category.cat_id,
    fnResponse = confirmAction('delete');
    fnResponse.then((status) => {
      if (status === true) {
        // specify default value for actionType
        actionType = actionType || 'soft';
        // declare json object
        let postedData = {
          hotel_id: category.hotel_id,
          cat_id: categoryId
        };
        // prepare ajax post URL based on actionType
        let ajaxFnName = (actionType === 'soft') ? 'delete' : 'deleteP';
        $.ajax({
          type: 'post',
          url: SITE_URL + 'request/api/' + ajaxFnName + 'RetailCategory',
          data: {
            postedData: postedData,
            [CSRF_TOK_NAME]: getCSRFToken()
          },
          success: ({data, message, response_tag, status}, textStatus, xhr) => {
            // check for auth expiry
            expTokenRedirect({response_tag:response_tag});
            if (status) {
              notificationHandler('success', message);
              _this.setState({
                categories: update(_this.state.categories, {
                  $splice: [[categoryIndex, 1]]
                })
              });
            } else {
              // there is some problem while deleting the record from database
              if (typeof(data['dependency-count']) != "undefined") {
                notificationHandler('warning', message);
              } else
                notificationHandler('error', message);
              }
            },
          error: (jqXHR) => {
            // error/exception handling
            ajaxErrorHandling(jqXHR);
          }
        });
      }
    });
  }

  changeStatusCategory(categoryIndex, isActive){
    let _this = this,
    categories = this.state.categories,
    category = categories[categoryIndex],
    catId = category.cat_id,
    statusText = (isActive == 1) ? 'activate' : 'inactive',
    fnResponse = confirmAction('confirm', catId,
      'Are you sure you want to ' + statusText + ' "'
      + category.display_name + '" category?');
    fnResponse.then((status) => {
      if (status === true) {
        let hotelId = category.hotel_id,
        postedData = {
          cat_id: catId,
          hotel_id: hotelId,
          is_active: isActive
        };
        $.ajax({
          type: 'POST',
          url: SITE_URL + "request/api/changeStatusRetailCategory",
          data: {
            postedData: postedData,
            [CSRF_TOK_NAME]: getCSRFToken()
          },
          success: function ({data, message, response_tag, status}, textStatus, xhr) {
            // check for auth expiry
            expTokenRedirect({response_tag:response_tag});
            if (status) {
              let msg = (isActive == 1)
                ? 'Retail category activated successfully.'
                  : 'Retail category deactivated successfully.';
              notificationHandler('success', msg);
              let category = data[hotelId][_this.state.lang_code];
              category.position = parseInt(category.position);
              _this.setState({
                categories: update(_this.state.categories, {
                  [categoryIndex]: {$set: category}
                })
              });
            } else {
              // there is some problem in updating record into database
              notificationHandler('error', message);
            }
          },
          error: function (jqXHR) {
            // error/exception handling
            ajaxErrorHandling(jqXHR);
          }
        });
      }
    });
  }

  viewItems(index){
    let category = this.state.categories[index];
    this.props.viewItems(this.props.feature, category);
  }

  handleSortable(sortedList){
    let postedData = {}, categories = this.state.categories, _this = this;
    postedData.cat_ids = $("#tab-feature-" + this.props.index + " #sortable-category .single-category-box").map((index, e) => {
      let catId = $(e).attr("id"),
      category = _.findWhere(categories, {cat_id:catId}),
      categoryIndex = categories.indexOf(category);
      categories[categoryIndex].position = index + 1;
      return catId;
    }).get();
    //postedData[CSRF_TOK_NAME] = getCSRFToken();
    postedData.hotel_id = $("#global-hotel-ddl").val();
    $.ajax({
      type: 'post',
      url: SITE_URL + 'request/api/sortCategories',
      data: {
        postedData: postedData,
        [CSRF_TOK_NAME]: getCSRFToken()
      },
      beforeSend: () => {
        $("#tab-feature-" + _this.props.index + " #sortable-category")
          .sortable("disable");
      },
      complete: () => {
        $("#tab-feature-" + _this.props.index + " #sortable-category")
          .sortable("enable");
      },
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect({response_tag:response_tag});
        if (status) {
          notificationHandler('success', message);
          categories = _.sortBy(categories, 'position');
          _this.setState({
            categories: categories
          });
        } else {
          notificationHandler('error', message);
        }
      },
      error: (jqXHR) => {
        $("#tab-feature-" + _this.props.index + " #sortable-category")
          .sortable("enable");
        // error/exception handling
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  filterCategory(e){
    let value = e.target.value;
    if (value) {
      value = value.toLowerCase();
      $("#tab-feature-" + this.props.index + " .single-category-box").addClass('hidden hideCount');
      $("#tab-feature-" + this.props.index + " .single-category-box[data-name*='" + value + "' i]").removeClass('hidden');
    } else {
      $("#tab-feature-" + this.props.index + " .single-category-box").removeClass('hidden');
    }
    $("#tab-feature-" + this.props.index + " .category-count")
      .text('Showing ' + $("#tab-feature-" + this.props.index + " .single-category-box")
      .not('.hidden').not('.hidden1').length + ' category(s)');
  }

  resetCatFilter(e){
    e.target.value = '';
    $("#tab-feature-" + this.props.index + ' .dv-search-input-with-value').val('');
    this.filterCategory(e);
  }

  initialJS(_this) {
    $(document).on('click', '#retail-item-box .backtoCategory', (e) => {
      let featureId = _this.props.feature.feature_id;
      if(updateCatList.hasOwnProperty(featureId)){
        _this.getCategory(updateCatList[featureId]);
        delete updateCatList[featureId];
      }
    });
    $('#global-hotel-ddl').change((e)=>{
      hotelId = $(e.target).val();
      _this.setState({
        hotel_id: hotelId
      });
    });
    _this.sortable(_this);
    $('#' + this.props.formId).submit((e) => {
      e.preventDefault();
      let url, hotelId,
      featureId = $('#retail-category-box .nav-tabs-component li.active a').attr('data-id');
      if($('#' + this.props.formId).valid()){
        let postedData = $('#' + _this.props.formId).serializeArray();
        postedData = serializeToJson(postedData);
        hotelId = postedData['hotel_id'];
        if(featureId != _this.props.feature.feature_id) return;
        if(_this.categoryId != null){
          postedData['cat_id'] = _this.category.cat_id;
            url = SITE_URL + "request/api/updateRetailCategory";
        }else{
          url = SITE_URL + "request/api/addRetailCategory";
        }
        postedData['feature_id'] = featureId;
        $.ajax({
          url: url,
          type: 'POST',
          data: {
            postedData: postedData,
            [CSRF_TOK_NAME]: getCSRFToken()
          },
          dataType: 'json',
          beforeSend: () => {
            $('#save-category').button('loading');
          },
          complete: () => {
            $('#save-category').button('reset');
          },
          success: ({data, message, response_tag, status}, textStatus, xhr) => {
            // check for auth expiry
            expTokenRedirect({response_tag:response_tag});
            if (status) {
              formReset(_this.props.formId);
              $('#retail-category-modal').modal('hide');
              notificationHandler('success', message);
              if(_this.categoryIndex != null){
                _this.setState({
                  categories: update(_this.state.categories, {
                    [_this.categoryIndex]: {$set: data[_this.state.hotel_id][_this.state.lang_code]}
                  })
                }, () => {
                  _this.category = null;
                  _this.categoryId = null;
                  _this.categoryIndex = null;
                  _this.props.resetForm();
                });
              }else{
                _this.setState({
                  categories: update(_this.state.categories, {
                    $push: [data[_this.state.hotel_id][_this.state.lang_code]]
                  })
                }, () => {
                  _this.props.resetForm();
                });
              }
            }else{
              notificationHandler('error', message);
            }
          },
          error: (jqXHR) => {
            $('#save-category').button('reset');
            ajaxErrorHandling(jqXHR);
          }
        });
      }
    });

    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', e => {
      const target = e.target;
      const index = $(target).attr('index');
      if(_this.getInitialCat && index == _this.props.index){
        _this.getInitialCat = false;
        _this.getCategories();
      }
    });
  }

  sortable(_this){
    try{
      $("#tab-feature-" + _this.props.index + " #sortable-category").sortable("destroy");
    }catch(e){}
    $("#tab-feature-" + _this.props.index + " #sortable-category").sortable({
      containment: "#tab-feature-" + _this.props.index + " #sortable-category",
      placeholder: "placeHolder col-md-2 col-md-3 col-sm-4 col-xs-6 col-md-5thumb",
      items: "> li.single-category-box",
      tolerance: "pointer",
      revert: true,
      update: _this.handleSortable
    });
  }

  render() {
    let activeCats = [], inActiveCats = []
    this.state.categories.map((category, index) => {
      if(category.is_active == 1){
        activeCats.push(<Category
          key={category.cat_id}
          category={category}
          index={index}
          featureIndex={this.props.index}
          editCategory={this.editCategory}
          deleteCategory={this.deleteCategory}
          changeStatusCategory={this.changeStatusCategory}
          viewItems={this.viewItems}/>);
      }else{
        inActiveCats.push(<Category
          key={category.cat_id}
          category={category}
          index={index}
          featureIndex={this.props.index}
          editCategory={this.editCategory}
          deleteCategory={this.deleteCategory}
          changeStatusCategory={this.changeStatusCategory}
          viewItems={this.viewItems}/>)
      }
    });
    return (<div
      className={"tab-pane" + ((this.props.index == 0) ? ' active' : '') + " retail-feature-tab"}
      id={"tab-feature-" + this.props.index} >
      {(this.state.is_loading) ? (
        <div className="col-sm-12 text-center">
          <i className="icon-spinner2 spinner data_loader"></i>
        </div>) : (<Fragment>
          <div className="row mb-15">
            <div className="col-md-12">
              <div className="col-md-8">
                <p className="text-muted category-count">
                  Showing {this.state.categories.length} category(s)
                </p>
              </div>
              <div className="col-md-4 text-right retail_module_search">
                <div className="row filter-bar pr-15">
                  <div className="dv-custom-search dv-custom-search-withcross">
                    <div className="has-feedback has-feedback-right">
                      <div className="has-feedback has-feedback-right">
                        <input type="search" className="form-control
                          dv-search-input-with-value"
                          placeholder="Search"
                          onChange={this.filterCategory.bind(this)}/>
                        <div className="form-control-feedback">
                          <i className="icon-search4 text-size-base
                          text-muted"></i>
                        </div>
                      </div>
                      <div className="form-control-feedback1
                      cross-form-control-feedback">
                        <i className="icon-cross text-size-base
                          text-muted" onClick={this.resetCatFilter.bind(this)}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="activeText">
            <h6>ACTIVE</h6>
          </div>
          <div className="dv-thumb-section retail-main-section clearfix">
            <div className="main-sort-div">
              <ul id="sortable-category" style={{minHeight: "325px",display: "none"}}
                className="clearfix retail-category-list
              retail-category-list-active animated">
                {activeCats}
                <li className="col-lg-3 col-sm-6 col-md-5thumb add-category add-retail-category">
                  <div className="thumbnail thumb-view" style={{height: "300px"}}>
                    <div className="thumb add-thumb-section" style={{height: "inherit"}}>
                      <a data-toggle="modal"
                        data-target="#retail-category-modal"
                      className="dv-addd-thumb">
                        <div className="manage-add-thumb">
                          <i className="icon-plus2"></i>
                          <span>Add Category</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="activeText">
            <hr/>
            <h6>INACTIVE</h6>
          </div>
          <div className="dv-thumb-section retail-main-section clearfix">
            <div className="main-sort-div">
              <ul className="clearfix retail-category-list animated"
                style={{minHeight: "325px",display: "none"}}>
                {inActiveCats}
                <li className="col-lg-3 col-sm-6 col-md-5thumb add-category">
                  <div className="thumbnail thumb-view" style={{height: "300px"}}>
                    <div className="thumb add-thumb-section" style={{height: "inherit"}}>
                      <a data-toggle="modal"
                        data-target="#retail-category-modal"
                      className="dv-addd-thumb">
                        <div className="manage-add-thumb">
                          <i className="icon-plus2"></i>
                          <span>Add Category</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div></Fragment>)}
    </div>);
  }
}

export default FeatureTab;


function Category(props){
  let catImg = IMG + "default-image.png";
  try {
    let assets = (props.category.assets)
      ? JSON.parse(props.category.assets)
      : [];
    catImg = (assets[0] != undefined) ? assets[0]['file_path'] : IMG + "default-image.png";
  } catch (e) {}
  return (<li id="thumbid1" data-catname={(props.category.display_name)}
    className="col-lg-3 col-sm-6 col-md-5thumb single-category-box retail-cat-box"
    id={props.category.cat_id} title="Double click to edit"
    onDoubleClick={() => {props.editCategory(props.index)}}
    data-name={(props.category.display_name).toLowerCase()}>
    <div className="thumbnail thumb-view">
      <div className="thumb">
        <img src={catImg} alt={props.category.display_name}/>
      </div>
      <div className="thumb-footer p-15 row">
        <div className="col-md-12 col-xs-12">
          <h5 className="no-margin truncate thumbTitle datatooltip"
            data-original-title={props.category.display_name}>
            {props.category.display_name}
          </h5>
        </div>
        <div className="col-md-10 truncate">{props.category.items} items</div>
        <div className="col-md-2 text-right">
          <ul className="icons-list pull-right">
            <li className="dropdown">
              <a href="javascript:void(0)" className="dropdown-toggle" data-toggle="dropdown">
                <i className="icon-more2"></i>
              </a>
              <ul className="dropdown-menu dropdown-menu-right">
                <li>
                  <a href="javascript:void(0);"
                    className="add-category-item"
                    data-cat_id={props.category.cat_id}
                    data-cat_index={props.index}
                    data-feature_index={props.featureIndex}>
                    Add Item
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" className="show-item"
                    onClick={() => {props.viewItems(props.index)}}>
                    View Items
                  </a>
                </li>
                <li className="divider"></li>
                <li>
                  <a href="javascript:void(0);"
                    onClick={() => {props.editCategory(props.index)}}>
                    Edit Category
                  </a>
                </li>
                <li className="deletedata">
                  <a href="javascript:void(0);"
                    onClick={() => {props.changeStatusCategory(props.index, (props.category.is_active == 1) ? 0 : 1)}}>
                    {(props.category.is_active == 1) ? 'In-Active' : 'Activate'}
                  </a>
                </li>
                <li className="deletedata">
                  <a href="javascript:void(0);"
                    onClick={() => {props.deleteCategory(props.index, 'soft')}}>
                    Delete
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </li>)
}
