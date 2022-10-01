import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Garden from 'App/Models/Garden';
import GardenValidator from 'App/Validators/GardenValidator';
import { Create, Edit, Index, Show } from 'Views/Gardens';

export default class GardensController {
  /*
   * index action
   */
  public async index({ bouncer, radonis, auth, i18n }: HttpContextContract) {
    await bouncer.with('GardenPolicy').authorize('list');
    const gardens = await Garden.query().where('user_id', auth.user!.id).select('*');

    return radonis.withTitle(i18n.formatMessage('gardens.index.title')).render(Index, { gardens });
  }

  /*
   * create action
   */
  public async create({ bouncer, radonis, i18n }: HttpContextContract) {
    await bouncer.with('GardenPolicy').authorize('create');

    return radonis.withTitle(i18n.formatMessage('gardens.create.title')).render(Create);
  }

  /*
   * store action
   */
  public async store({ bouncer, request, response, auth }: HttpContextContract) {
    await bouncer.with('GardenPolicy').authorize('create');
    const data = await request.validate(GardenValidator);
    await Garden.create({
      ...data,
      userId: auth.user!.id,
    });

    return response.redirect().toRoute('gardens.index');
  }

  /*
   * show action
   */
  public async show({ bouncer, radonis, params, i18n }: HttpContextContract) {
    const garden = await Garden.findOrFail(params.id);
    await bouncer.with('GardenPolicy').authorize('view', garden);

    return radonis
      .withTitle(i18n.formatMessage('gardens.show.title', { name: garden.name }))
      .render(Show, { garden });
  }

  /*
   * edit action
   */
  public async edit({ bouncer, radonis, params, i18n }: HttpContextContract) {
    const garden = await Garden.findOrFail(params.id);
    await bouncer.with('GardenPolicy').authorize('edit', garden);

    return radonis
      .withTitle(i18n.formatMessage('gardens.edit.title', { name: garden.name }))
      .render(Edit, { garden });
  }

  /*
   * update action
   */
  public async update({ bouncer, request, params, response }: HttpContextContract) {
    const garden = await Garden.findOrFail(params.id);
    await bouncer.with('GardenPolicy').authorize('edit', garden);
    const data = await request.validate(GardenValidator);
    await garden.merge(data).save();

    return response.redirect().toRoute('gardens.index');
  }

  /*
   * destroy action
   */
  public async destroy({ bouncer, request, params, response }: HttpContextContract) {
    const garden = await Garden.findOrFail(params.id);
    await bouncer.with('GardenPolicy').authorize('delete', garden);
    await garden.delete();

    if (request.accepts(['json'])) {
      return response.json(true);
    }

    return response.redirect().back();
  }
}