import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { API } from '../api';
import { E2E } from '../../../../server/sdk';
import { Subscriptions } from '../../../models/server';

API.v1.addRoute('e2e.fetchMyKeys', { authRequired: true }, {
	async get() {
		const uid = Meteor.userId();
		if (!uid) {
			return API.v1.failure('Invalid user');
		}

		const result = await E2E.getUserKeys(uid);

		return API.v1.success(result);
	},
});

API.v1.addRoute('e2e.getUsersOfRoomWithoutKey', { authRequired: true }, {
	async get() {
		check(this.queryParams, Match.ObjectIncluding({
			rid: String,
		}));

		const { rid } = this.queryParams;

		const users = await E2E.getRoomMembersWithoutPublicKey(this.userId, rid);

		return API.v1.success({
			users,
		});
	},
});

API.v1.addRoute('e2e.setRoomKeyID', { authRequired: true }, {
	async post() {
		check(this.bodyParams, Match.ObjectIncluding({
			rid: String,
			keyID: String,
		}));

		const { rid, keyID } = this.bodyParams;

		await E2E.setRoomKeyId(this.userId, rid, keyID);

		return API.v1.success();
	},
});

API.v1.addRoute('e2e.setUserPublicAndPrivateKeys', { authRequired: true }, {
	async post() {
		check(this.bodyParams, Match.ObjectIncluding({
			// eslint-disable-next-line @typescript-eslint/camelcase
			public_key: String,
			// eslint-disable-next-line @typescript-eslint/camelcase
			private_key: String,
		}));

		// eslint-disable-next-line @typescript-eslint/camelcase
		const { public_key, private_key } = this.bodyParams;

		// eslint-disable-next-line @typescript-eslint/camelcase
		await E2E.setUserKeys(this.userId, { public_key, private_key });

		return API.v1.success();
	},
});

API.v1.addRoute('e2e.updateGroupKey', { authRequired: true }, {
	async post() {
		check(this.bodyParams, Match.ObjectIncluding({
			uid: String,
			rid: String,
			key: String,
		}));

		const { uid, rid, key } = this.bodyParams;

		const mySub = await Subscriptions.findOneByRoomIdAndUserId(rid, Meteor.userId());
		if (mySub) { // I have a subscription to this room
			const userSub = await Subscriptions.findOneByRoomIdAndUserId(rid, uid);
			if (userSub) { // uid also has subscription to this room
				return API.v1.success(await Subscriptions.updateGroupE2EKey(userSub._id, key));
			}
		}

		return API.v1.success();
	},
});