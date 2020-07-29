// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { ChangeEvent } from 'react';

type Props = {
    name: string;
    checked: boolean;
    label: string | JSX.Element;
    updateOption: (checked: boolean, name: string) => void;
};

class FilterCheckbox extends React.PureComponent<Props> {
    toggleOption = () => {
        const {checked, name, updateOption} = this.props;
        updateOption(!checked, name);
    }

    render() {
        const {name, checked, label} = this.props;

        return (
            <div
                className='FilterList_checkbox'
            >
                <label
                    key={Math.random()}
                    onClick={this.toggleOption}
                >
                    <input
                        type='checkbox'
                        id={name}
                        name={name}
                        defaultChecked={checked}
                    />
                    {label}
                </label>
            </div>
        );
    }
}

export default FilterCheckbox;
