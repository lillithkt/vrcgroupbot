import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export default class SlashCommand {
  private _built: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | null =
    null;
  get builder() {
    if (!this._built) {
      this._built = this._builder();
    }
    return this._built;
  }
  private _builder: () => SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  run: (interaction: CommandInteraction) => Promise<unknown>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>;
  ownerOnly = false;
  constructor(
    builder: () => SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    run: (interaction: CommandInteraction) => Promise<unknown>,
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>,
    ownerOnly = false
  ) {
    this._builder = builder;
    this.run = run;
    this.autocomplete = autocomplete;
    this.ownerOnly = ownerOnly;
  }
}
