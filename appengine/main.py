import webapp2
import time
import json
import pubsub_utils

class PushToPubSub(webapp2.RequestHandler):
    def get(self, topic):
        pubsub_utils.publish_to_topic(topic, str(time.time()))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps({"status": "200"}))

app = webapp2.WSGIApplication([
    webapp2.Route(r'/publish/<topic>', handler=PushToPubSub)
], debug=True)
