import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Posts } from './posts';

export const SubPosts = new Mongo.Collection('subPosts');

if (Meteor.isServer) {
  Meteor.publish('subPosts', ({ postId, count }) => {
    return SubPosts.find({ postId }, { sort: { updatedAt: 1 }, limit: count });
  });
}

Meteor.methods({
  'subPosts.insert'({ content, tagId, postId, publicIds }) {
    check(content, String);
    check(postId, String);
    check(tagId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    SubPosts.insert({
      postId,
      tagId,
      content,
      publicIds,
      userId: this.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: [], // Should be UserId
      commentsCount: 0,
      clipedCount: 0,
    }, (err) => {
      if (err) {
        throw new Meteor.Error(err.message);
      } else {
        const count = SubPosts.find({ postId }).count();
        Posts.update(postId, { $set: { subPostsCount: count, updatedAt: new Date() } });
      }
    });
  },
});
