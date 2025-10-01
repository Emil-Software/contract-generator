import { IPartiContratto } from "../interfaces/content";
import { SectionsText } from "../interfaces/doc";

export class TemplateProcessor {
  private readonly tagRegex = /<\|(.*?)\|>/g;

  public stripFormattingTags(text: string): string {
    return text?.replace(this.tagRegex, "").trim();
  }

  public applyTemplate(template: string, dynamicFields?: { [key: string]: string }): string {
    if (!dynamicFields) return template;
    return template.replace(/\$(\w+)\$/g, (match, key) =>
      dynamicFields[key] !== undefined ? dynamicFields[key] : match
    );
  }

  public applyPartiPlaceholders(text: string, parti?: IPartiContratto): string {
    if (!parti) {
      return text;
    }
    return text.replace(/\$(fornitore|cliente):(\w+)\$/g, (match, party, field) =>
      (parti[party] && (parti[party] as any)[field]) ? (parti[party] as any)[field] : match
    );
  }

  public getTagConfigurations(text: string): string[][] {
    const matches = Array.from(text.matchAll(this.tagRegex));
    return matches.map(match =>
      match[1]
        .trim()
        .split(';')
        .map(segment => segment.trim())
        .filter(Boolean)
    );
  }

  public parseKeyValue(tagContent: string): [string, string] | null {
    if (!tagContent.includes(':')) {
      return null;
    }
    const [key, value] = tagContent.split(':').map(s => s.trim());
    return [key, value];
  }

  public parseBoldSections(content: string): SectionsText[] {
    let sections: SectionsText[] = [];
    let index = 0;
    let matches = Array.from(content.matchAll(/\*\*(.*?)\*\*/g));
    if (matches.length === 0) {
      sections.push({
        text: content,
        type: 'normal',
        start: 0,
        end: content.length
      });
    } else {
      while (index < content.length) {
        for (const match of matches) {
          if (index !== match['index']) {
            sections.push({
              text: content.substring(index, match['index']),
              type: 'normal',
              start: index,
              end: match['index']
            });
          }
          sections.push({
            text: content.substring(match['index'], match['index'] + match[0].length),
            type: 'bold',
            start: match['index'],
            end: match['index'] + match[0].length
          });
          index = match['index'] + match[0].length;
        }
        sections.push({
          text: content.substring(index, content.length),
          type: 'normal',
          start: index,
          end: content.length - 1
        });
        index = content.length;
      }
    }
    return sections;
  }
}
