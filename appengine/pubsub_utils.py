import sys
sys.path.append("./lib")

import base64
from time import strftime
import httplib2
import oauth2client.contrib.appengine as gae_oauth2client
from apiclient import discovery
from google.appengine.api import memcache
from google.appengine.api import app_identity
from google.appengine.api import urlfetch

from googleapiclient.errors import HttpError

PUBSUB_SCOPES = ["https://www.googleapis.com/auth/pubsub"]

def get_client():
    """Creates Pub/Sub client and returns it."""
    credentials = gae_oauth2client.AppAssertionCredentials(scope=PUBSUB_SCOPES)
    http = httplib2.Http(memcache)
    credentials.authorize(http)

    return discovery.build('pubsub', 'v1', http=http)


def get_full_topic_name(name):
    return 'projects/{}/topics/{}'.format(get_project_id(), name)


def get_project_id():
    return app_identity.get_application_id()


def publish_to_topic(topic, msg='', create=True):
    urlfetch.set_default_fetch_deadline(180)
    pubsub = get_client()
    full_name = get_full_topic_name(topic)
    message = {"messages": [{"data": base64.b64encode(msg)}]}
    try:
        pubsub.projects().topics().publish(topic=full_name,
                                           body=message).execute()
    except HttpError as e:
        if create and e.resp.status == 404 and "Resource not found" in e.content:
            pubsub.projects().topics().create(name=full_name,
                                              body={}).execute()
            pubsub.projects().topics().publish(topic=full_name,
                                               body=message).execute()
        else:
            raise
