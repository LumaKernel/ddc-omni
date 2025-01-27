import {
  BaseSource,
  Candidate,
  DdcOptions,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v0.5.0/types.ts#^";
import { Denops, op } from "https://deno.land/x/ddc_vim@v0.5.0/deps.ts#^";

type Params = {
  blacklist: string[];
  omnifunc: string;
};

export class Source extends BaseSource {
  isBytePos = true;

  async getCompletePosition(args: {
    denops: Denops;
    sourceParams: Params;
  }): Promise<number> {
    const omnifunc = (args.sourceParams.omnifunc == "")
      ? await op.omnifunc.getLocal(args.denops)
      : args.sourceParams.omnifunc;
    if (omnifunc == "" || omnifunc in args.sourceParams.blacklist) {
      return Promise.resolve(-1);
    }

    try {
      const pos = await args.denops.call(omnifunc, 1, "") as number;
      return Promise.resolve(pos);
    } catch (e: unknown) {
      console.error(
        `[ddc.vim] omni: omnifunc ${omnifunc} getCompletePosition() is failed`,
      );
      console.error(e);
      return Promise.resolve(-1);
    }
  }
  async gatherCandidates(args: {
    denops: Denops;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Candidate[]> {
    const omnifunc = (args.sourceParams.omnifunc == "")
      ? await op.omnifunc.getLocal(args.denops)
      : args.sourceParams.omnifunc;
    if (omnifunc == "" || omnifunc in args.sourceParams.blacklist) {
      return Promise.resolve([]);
    }

    try {
      const ret = await args.denops.call(omnifunc, 0, "");
      if (ret instanceof Array && ret.length != 0) {
        return Promise.resolve(ret.map(
          (candidate) =>
            (candidate instanceof String) ? { word: candidate } : candidate,
        ));
      } else {
        // Invalid
        return [];
      }
    } catch (e: unknown) {
      console.error(
        `[ddc.vim] omni: omnifunc ${omnifunc} getCompletePosition() is failed`,
      );
      console.error(e);
      return [];
    }
  }

  params(): Record<string, unknown> {
    const params: Params = {
      blacklist: [
        "LanguageClient#complete",
        "ccomplete#Complete",
        "htmlcomplete#CompleteTags",
        "phpcomplete#CompletePHP",
        "rubycomplete#Complete",
      ],
      omnifunc: "",
    };
    return params as unknown as Record<string, unknown>;
  }
}
