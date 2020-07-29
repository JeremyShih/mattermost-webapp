// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {createSelector} from 'reselect';

import {UserProfile} from 'mattermost-redux/types/users';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {filterProfilesMatchingTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';

import {filterProfiles} from 'mattermost-redux/selectors/entities/users';
import {getMembersInTeams} from 'mattermost-redux/selectors/entities/teams';
import {getChannelMembersInChannels} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';
import {loadChannelMembersForProfilesList, loadTeamMembersForProfilesList} from 'actions/user_actions.jsx';
import {setModalSearchTerm, setModalFilters} from 'actions/views/search';

import GroupUsers, {Filters, Memberships} from './group_users';

type Props = {
    members: UserProfile[];
    scope: string;
    scopeId: string;
    total: number;
};

type Actions = {
    loadTeamMembersForProfilesList: (profiles: UserProfile[], id: string, reloadAllMembers?: boolean) => Promise<{
        data: boolean;
    }>;
    loadChannelMembersForProfilesList: (profiles: UserProfile[], id: string, reloadAllMembers?: boolean) => Promise<{
        data: boolean;
    }>;
    setModalSearchTerm: (term: string) => Promise<{
        data: boolean;
    }>;
    setModalFilters: (filters: Filters) => Promise<{
        data: boolean;
    }>;
};

const searchUsers = createSelector(
    (users: UserProfile[]) => users,
    (users: any, term: string) => term.trim().toLowerCase(),
    (users: any, term: string, filters: Filters) => filters,
    (users: any, term: string, filters: Filters, memberships: Memberships) => memberships,
    (users: UserProfile[], term: string, filters: Filters, memberships: Memberships): UserProfile[] => {
        let profiles = users;
        if (term !== '') {
            profiles = filterProfilesMatchingTerm(users, term);
        }

        if (Object.keys(filters).length > 0) {
            const filteredProfilesMap = filterProfiles(profileListToMap(profiles), filters, memberships);
            profiles = Object.keys(filteredProfilesMap).map((key) => filteredProfilesMap[key]);
        }

        return profiles
    },
);

function mapStateToProps(state: GlobalState, props: Props) {
    let {members, total, scope, scopeId} = props;

    const searchTerm = state.views.search.modalSearch.term || '';
    const filters = state.views.search.modalSearch.filters || {};

    let memberships = {};
    if (scope === 'channel') {
        memberships = getChannelMembersInChannels(state)[scopeId] || {};
    } else if (scope === 'team') {
        memberships = getMembersInTeams(state)[scopeId] || {};
    }

    if (searchTerm || Object.keys(filters).length > 0) {
        members = searchUsers(members, searchTerm, filters, memberships);
        console.log(members);
        total = members.length;
    }

    const enableGuestAccounts = getConfig(state)?.EnableGuestAccounts === 'true';

    return {
        ...props,
        members,
        total,
        searchTerm,
        scope,
        memberships,
        enableGuestAccounts,
        filters,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            loadChannelMembersForProfilesList,
            loadTeamMembersForProfilesList,
            setModalSearchTerm,
            setModalFilters,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupUsers);
