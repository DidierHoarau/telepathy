#/bin/bash

set -e

NAMESPACE=telepathy
kubectl create ns ${NAMESPACE}
kubectl kustomize kustomize/base | kubectl apply -n ${NAMESPACE} -f -
