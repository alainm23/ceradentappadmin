import * as functions from 'firebase-functions';
import algoliasearch from 'algoliasearch';

const client = algoliasearch ('S9Z0BUVW9R', '34d4989ee34f43acce877f2d15c61611');
const index = client.initIndex ('Doctores');

// Algolia
exports.add_doctor = functions.firestore.document ('Doctores/{id}').onCreate (async (snapshot: any, context: any) => {
  const data: any = {
    'apellidos': snapshot.data ().apellidos,
    'dni': snapshot.data ().dni,
    'email': snapshot.data ().email,
    'especialidades': snapshot.data ().especialidades,
    'nombres': snapshot.data ().nombres,
    'nro_colegiatura': snapshot.data ().nro_colegiatura,
    'puntaje': snapshot.data ().puntaje,
    'telefono': snapshot.data ().telefono
  };

  const objectID = snapshot.id;
  return index.saveObject ({
    objectID,
    ...data
  });
});

exports.update_doctor = functions.firestore.document ('Doctores/{id}').onUpdate (async (snapshot: functions.Change<functions.firestore.QueryDocumentSnapshot>, context: any) => {
  const data: any = {
    'apellidos': snapshot.after.data ().apellidos,
    'dni': snapshot.after.data ().dni,
    'email': snapshot.after.data ().email,
    'especialidades': snapshot.after.data ().especialidades,
    'nombres': snapshot.after.data ().nombres,
    'nro_colegiatura': snapshot.after.data ().nro_colegiatura,
    'puntaje': snapshot.after.data ().puntaje,
    'telefono': snapshot.after.data ().telefono,
    'objectID': snapshot.after.id
  };

  console.log (data);

  return index.saveObject (data).then ((res: any) => {
    console.log (res);
  }).catch ((error: any) => {
    console.log (error);
  });
});

exports.delete_doctor = functions.firestore.document ('Doctores/{id}').onDelete (async (snapshot: any, context: any) => {
  return index.deleteObject (snapshot.id);
});
