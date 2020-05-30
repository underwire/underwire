const React = require('react');

class Select extends React.Component {
  getValue() {
    if (this.props.multiple) {
      var values = [].filter
        .call(this.refs.editor.options, function(o) {
          return o.selected;
        })
        .map(function(o) {
          return o.value;
        });
      return values;
    }
    return this.refs.editor.value;
  }

  render() {
    const inputProps = Object.keys(this.props).reduce((obj, key) => {
      if (key === 'label') {
        return obj;
      }
      if (key === 'value') {
        obj.defaultValue = this.props.mapValues
          ? this.props.mapValues(this.props.value)
          : this.props.value;
        return obj;
      }
      if (key === 'items') {
        return obj;
      }
      obj[key] = this.props[key];
      return obj;
    }, {});
    const value = this.props.value;
    const options = this.props.items.map(option => {
      const isString = typeof option === 'string';
      const id = isString ? option : option.id || option.caption;
      const caption = isString ? option : option.caption;
      if (value && value === id) {
        return (
          <option key={id || caption} value={id} selected={true}>
            {caption}
          </option>
        );
      }
      return (
        <option key={id || caption} value={id}>
          {caption}
        </option>
      );
    });

    return (
      <select type="date" className="form-control" {...inputProps} ref="editor">
        {options}
      </select>
    );
  }
}

module.exports = Select;
